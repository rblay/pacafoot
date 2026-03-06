import type { Player, MatchEvent, MatchResult, LineupSelection, PlannedSub } from '../types';
import { calculateTeamStrength, calculateAttackStrength, calculateDefenseStrength } from './teamStrength';

/**
 * Simulate a full match between two teams.
 *
 * Goal probability per minute is based on:
 * - Team attack strength vs opponent defense strength
 * - Home advantage (+5% strength bonus)
 * - Base probability ~2.5 goals per 90 min total (real Serie A average)
 */
export function simulateMatch(
  homeTeamId: string,
  awayTeamId: string,
  homePlayers: Player[],
  awayPlayers: Player[],
  homeLineup: LineupSelection,
  awayLineup: LineupSelection,
  round: number,
  stadium: string,
  capacity: number,
): MatchResult {
  let homeXI = homePlayers.filter(p => homeLineup.startingXI.includes(p.id));
  let awayXI = awayPlayers.filter(p => awayLineup.startingXI.includes(p.id));

  const homeBooked = new Set<string>();
  const awayBooked = new Set<string>();

  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  for (let minute = 1; minute <= 90; minute++) {
    const half: 1 | 2 = minute <= 45 ? 1 : 2;

    const homeStrength = calculateTeamStrength(homeXI) * 1.05;
    const awayStrength = calculateTeamStrength(awayXI);
    const homeAttack = calculateAttackStrength(homeXI);
    const awayAttack = calculateAttackStrength(awayXI);
    const homeDefense = calculateDefenseStrength(homeXI);
    const awayDefense = calculateDefenseStrength(awayXI);

    // Home goal chance
    const homeGoalProb = 0.014 * (homeAttack / Math.max(awayDefense, 1)) * (homeStrength / 70);
    if (Math.random() < homeGoalProb) {
      homeScore++;
      const scorer = pickScorer(homeXI);
      events.push({ minute, half, type: 'goal', playerId: scorer.id, playerName: scorer.name, team: 'home', score: `${homeScore}x${awayScore}` });
    }

    // Away goal chance
    const awayGoalProb = 0.014 * (awayAttack / Math.max(homeDefense, 1)) * (awayStrength / 70);
    if (Math.random() < awayGoalProb) {
      awayScore++;
      const scorer = pickScorer(awayXI);
      events.push({ minute, half, type: 'goal', playerId: scorer.id, playerName: scorer.name, team: 'away', score: `${homeScore}x${awayScore}` });
    }

    // Cards
    const { cardEvents, homeRedIds, awayRedIds } = simulateCardMinute(
      minute, half, homeXI, awayXI, homeBooked, awayBooked, homeScore, awayScore,
    );
    events.push(...cardEvents);
    homeXI = homeXI.filter(p => !homeRedIds.includes(p.id));
    awayXI = awayXI.filter(p => !awayRedIds.includes(p.id));
  }

  const attendance = Math.round(capacity * (0.6 + Math.random() * 0.35));

  return { round, homeTeamId, awayTeamId, homeScore, awayScore, events, homeLineup, awayLineup, attendance, stadium };
}

/** Pick a goal scorer weighted by position (attackers score more) */
function pickScorer(players: Player[]): Player {
  const weights: Record<string, number> = { A: 5, M: 3, L: 1, Z: 1, G: 0.1 };
  const weighted = players.map(p => ({ player: p, weight: (weights[p.position] ?? 1) * (p.rating / 70) }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * total;
  for (const w of weighted) {
    rand -= w.weight;
    if (rand <= 0) return w.player;
  }
  return players[0];
}

/**
 * Simulate card events for a single minute.
 * - Yellow card: ~0.022/min per team (~2 yellows/game per team, ~4 total)
 * - Second yellow in same match → red card
 * - Direct red: ~0.0015/min per team (~0.14/game per team, ~0.28 total)
 * Returns the card events and the IDs of any players who received a red (to remove from XI).
 */
function simulateCardMinute(
  minute: number,
  half: 1 | 2,
  homeXI: Player[],
  awayXI: Player[],
  homeBooked: Set<string>,
  awayBooked: Set<string>,
  homeScore: number,
  awayScore: number,
): { cardEvents: MatchEvent[]; homeRedIds: string[]; awayRedIds: string[] } {
  const cardEvents: MatchEvent[] = [];
  const homeRedIds: string[] = [];
  const awayRedIds: string[] = [];
  const score = `${homeScore}x${awayScore}`;

  for (const side of ['home', 'away'] as const) {
    const xi = side === 'home' ? homeXI : awayXI;
    const booked = side === 'home' ? homeBooked : awayBooked;
    const reds = side === 'home' ? homeRedIds : awayRedIds;

    if (xi.length === 0) continue;

    // Yellow / second yellow
    if (Math.random() < 0.022) {
      const player = xi[Math.floor(Math.random() * xi.length)];
      if (booked.has(player.id)) {
        // Second yellow → red
        cardEvents.push({ minute, half, type: 'red_card', playerId: player.id, playerName: player.name, team: side, score });
        reds.push(player.id);
        booked.delete(player.id);
      } else {
        cardEvents.push({ minute, half, type: 'yellow_card', playerId: player.id, playerName: player.name, team: side, score });
        booked.add(player.id);
      }
    }

    // Direct red
    if (Math.random() < 0.0015) {
      const player = xi[Math.floor(Math.random() * xi.length)];
      if (!reds.includes(player.id)) {
        cardEvents.push({ minute, half, type: 'red_card', playerId: player.id, playerName: player.name, team: side, score });
        reds.push(player.id);
        booked.delete(player.id);
      }
    }
  }

  return { cardEvents, homeRedIds, awayRedIds };
}

/**
 * Simulate a segment of a match from `fromMinute` to `toMinute` (inclusive).
 *
 * Unlike `simulateMatch`, this function:
 * - Starts from a provided score
 * - Accepts planned substitutions for both teams; subs fire at their specified minute,
 *   updating the active XI and recomputing strengths for the remaining minutes
 * - Returns only the events that occur within [fromMinute, toMinute]
 *
 * Used for the live player match where the user can make mid-match substitutions.
 */
export function simulateSegment(
  fromMinute: number,
  toMinute: number,
  _homeTeamId: string,
  _awayTeamId: string,
  homePlayers: Player[],
  awayPlayers: Player[],
  homeLineup: LineupSelection,
  awayLineup: LineupSelection,
  currentScore: { home: number; away: number },
  homePlannedSubs: PlannedSub[] = [],
  awayPlannedSubs: PlannedSub[] = [],
  homeBooked: Set<string> = new Set(),
  awayBooked: Set<string> = new Set(),
): MatchEvent[] {
  const homePlayerMap = new Map(homePlayers.map(p => [p.id, p]));
  const awayPlayerMap = new Map(awayPlayers.map(p => [p.id, p]));

  let homeXIIds = [...homeLineup.startingXI];
  let awayXIIds = [...awayLineup.startingXI];

  const homeSubsRemaining = [...homePlannedSubs];
  const awaySubsRemaining = [...awayPlannedSubs];

  let homeScore = currentScore.home;
  let awayScore = currentScore.away;
  const events: MatchEvent[] = [];

  for (let minute = fromMinute; minute <= toMinute; minute++) {
    const half: 1 | 2 = minute <= 45 ? 1 : 2;

    // Apply planned home subs
    for (const sub of homeSubsRemaining.filter(s => s.minute === minute)) {
      const idx = homeXIIds.indexOf(sub.playerOut);
      if (idx !== -1) {
        homeXIIds[idx] = sub.playerIn;
        const playerIn = homePlayerMap.get(sub.playerIn);
        const playerOut = homePlayerMap.get(sub.playerOut);
        if (playerIn && playerOut) {
          events.push({ minute, half, type: 'substitution', playerId: playerIn.id, playerName: playerIn.name, playerOutId: playerOut.id, playerOutName: playerOut.name, team: 'home', score: `${homeScore}x${awayScore}` });
        }
      }
    }
    homeSubsRemaining.splice(0, homeSubsRemaining.length, ...homeSubsRemaining.filter(s => s.minute !== minute));

    // Apply planned away subs
    for (const sub of awaySubsRemaining.filter(s => s.minute === minute)) {
      const idx = awayXIIds.indexOf(sub.playerOut);
      if (idx !== -1) {
        awayXIIds[idx] = sub.playerIn;
        const playerIn = awayPlayerMap.get(sub.playerIn);
        const playerOut = awayPlayerMap.get(sub.playerOut);
        if (playerIn && playerOut) {
          events.push({ minute, half, type: 'substitution', playerId: playerIn.id, playerName: playerIn.name, playerOutId: playerOut.id, playerOutName: playerOut.name, team: 'away', score: `${homeScore}x${awayScore}` });
        }
      }
    }
    awaySubsRemaining.splice(0, awaySubsRemaining.length, ...awaySubsRemaining.filter(s => s.minute !== minute));

    const homeXI = homeXIIds.map(id => homePlayerMap.get(id)).filter(Boolean) as Player[];
    const awayXI = awayXIIds.map(id => awayPlayerMap.get(id)).filter(Boolean) as Player[];

    const homeStrength = calculateTeamStrength(homeXI) * 1.05;
    const awayStrength = calculateTeamStrength(awayXI);
    const homeAttack = calculateAttackStrength(homeXI);
    const awayAttack = calculateAttackStrength(awayXI);
    const homeDefense = calculateDefenseStrength(homeXI);
    const awayDefense = calculateDefenseStrength(awayXI);

    // Home goal
    const homeGoalProb = 0.014 * (homeAttack / Math.max(awayDefense, 1)) * (homeStrength / 70);
    if (Math.random() < homeGoalProb) {
      homeScore++;
      const scorer = pickScorer(homeXI);
      events.push({ minute, half, type: 'goal', playerId: scorer.id, playerName: scorer.name, team: 'home', score: `${homeScore}x${awayScore}` });
    }

    // Away goal
    const awayGoalProb = 0.014 * (awayAttack / Math.max(homeDefense, 1)) * (awayStrength / 70);
    if (Math.random() < awayGoalProb) {
      awayScore++;
      const scorer = pickScorer(awayXI);
      events.push({ minute, half, type: 'goal', playerId: scorer.id, playerName: scorer.name, team: 'away', score: `${homeScore}x${awayScore}` });
    }

    // Cards
    const { cardEvents, homeRedIds, awayRedIds } = simulateCardMinute(
      minute, half, homeXI, awayXI, homeBooked, awayBooked, homeScore, awayScore,
    );
    events.push(...cardEvents);
    homeXIIds = homeXIIds.filter(id => !homeRedIds.includes(id));
    awayXIIds = awayXIIds.filter(id => !awayRedIds.includes(id));
  }

  return events;
}
