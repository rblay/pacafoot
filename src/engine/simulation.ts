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
  const homeXI = homePlayers.filter(p => homeLineup.startingXI.includes(p.id));
  const awayXI = awayPlayers.filter(p => awayLineup.startingXI.includes(p.id));

  const homeStrength = calculateTeamStrength(homeXI) * 1.05; // home advantage
  const awayStrength = calculateTeamStrength(awayXI);

  const homeAttack = calculateAttackStrength(homeXI);
  const awayAttack = calculateAttackStrength(awayXI);
  const homeDefense = calculateDefenseStrength(homeXI);
  const awayDefense = calculateDefenseStrength(awayXI);

  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  for (let minute = 1; minute <= 90; minute++) {
    const half: 1 | 2 = minute <= 45 ? 1 : 2;

    // Home goal chance: based on home attack vs away defense
    // Base prob per minute ~0.014 (about 1.3 goals/game per team)
    const homeGoalProb = 0.014 * (homeAttack / Math.max(awayDefense, 1)) * (homeStrength / 70);
    if (Math.random() < homeGoalProb) {
      homeScore++;
      const scorer = pickScorer(homeXI);
      events.push({
        minute,
        half,
        type: 'goal',
        playerId: scorer.id,
        playerName: scorer.name,
        team: 'home',
        score: `${homeScore}x${awayScore}`,
      });
    }

    // Away goal chance
    const awayGoalProb = 0.014 * (awayAttack / Math.max(homeDefense, 1)) * (awayStrength / 70);
    if (Math.random() < awayGoalProb) {
      awayScore++;
      const scorer = pickScorer(awayXI);
      events.push({
        minute,
        half,
        type: 'goal',
        playerId: scorer.id,
        playerName: scorer.name,
        team: 'away',
        score: `${homeScore}x${awayScore}`,
      });
    }

    // Yellow card chance (~4 per game total)
    if (Math.random() < 0.022) {
      const team: 'home' | 'away' = Math.random() < 0.5 ? 'home' : 'away';
      const xi = team === 'home' ? homeXI : awayXI;
      const player = xi[Math.floor(Math.random() * xi.length)];
      events.push({
        minute,
        half,
        type: 'yellow_card',
        playerId: player.id,
        playerName: player.name,
        team,
        score: `${homeScore}x${awayScore}`,
      });
    }
  }

  // Attendance: 60-95% of capacity
  const attendance = Math.round(capacity * (0.6 + Math.random() * 0.35));

  return {
    round,
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    events,
    homeLineup,
    awayLineup,
    attendance,
    stadium,
  };
}

/** Pick a goal scorer weighted by position (attackers score more) */
function pickScorer(players: Player[]): Player {
  const weights: Record<string, number> = { A: 5, M: 3, L: 1, Z: 1, G: 0.1 };
  const weighted = players.map(p => ({
    player: p,
    weight: (weights[p.position] ?? 1) * (p.rating / 70),
  }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * total;
  for (const w of weighted) {
    rand -= w.weight;
    if (rand <= 0) return w.player;
  }
  return players[0];
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
): MatchEvent[] {
  // Build mutable ID→Player lookup maps
  const homePlayerMap = new Map(homePlayers.map(p => [p.id, p]));
  const awayPlayerMap = new Map(awayPlayers.map(p => [p.id, p]));

  // Mutable active XIs (IDs only; convert to Player[] per minute)
  let homeXIIds = [...homeLineup.startingXI];
  let awayXIIds = [...awayLineup.startingXI];

  // Track which planned subs have been applied
  const homeSubsRemaining = [...homePlannedSubs];
  const awaySubsRemaining = [...awayPlannedSubs];

  let homeScore = currentScore.home;
  let awayScore = currentScore.away;
  const events: MatchEvent[] = [];

  for (let minute = fromMinute; minute <= toMinute; minute++) {
    const half: 1 | 2 = minute <= 45 ? 1 : 2;

    // Apply any planned subs that fire this minute
    for (const sub of homeSubsRemaining.filter(s => s.minute === minute)) {
      const idx = homeXIIds.indexOf(sub.playerOut);
      if (idx !== -1) {
        homeXIIds[idx] = sub.playerIn;
        const playerIn = homePlayerMap.get(sub.playerIn);
        const playerOut = homePlayerMap.get(sub.playerOut);
        if (playerIn && playerOut) {
          events.push({
            minute,
            half,
            type: 'substitution',
            playerId: playerIn.id,
            playerName: playerIn.name,
            playerOutId: playerOut.id,
            playerOutName: playerOut.name,
            team: 'home',
            score: `${homeScore}x${awayScore}`,
          });
        }
      }
    }
    // Remove fired home subs
    homeSubsRemaining.splice(0, homeSubsRemaining.length,
      ...homeSubsRemaining.filter(s => s.minute !== minute));

    for (const sub of awaySubsRemaining.filter(s => s.minute === minute)) {
      const idx = awayXIIds.indexOf(sub.playerOut);
      if (idx !== -1) {
        awayXIIds[idx] = sub.playerIn;
        const playerIn = awayPlayerMap.get(sub.playerIn);
        const playerOut = awayPlayerMap.get(sub.playerOut);
        if (playerIn && playerOut) {
          events.push({
            minute,
            half,
            type: 'substitution',
            playerId: playerIn.id,
            playerName: playerIn.name,
            playerOutId: playerOut.id,
            playerOutName: playerOut.name,
            team: 'away',
            score: `${homeScore}x${awayScore}`,
          });
        }
      }
    }
    awaySubsRemaining.splice(0, awaySubsRemaining.length,
      ...awaySubsRemaining.filter(s => s.minute !== minute));

    // Resolve current Player arrays from active IDs
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
      events.push({
        minute,
        half,
        type: 'goal',
        playerId: scorer.id,
        playerName: scorer.name,
        team: 'home',
        score: `${homeScore}x${awayScore}`,
      });
    }

    // Away goal
    const awayGoalProb = 0.014 * (awayAttack / Math.max(homeDefense, 1)) * (awayStrength / 70);
    if (Math.random() < awayGoalProb) {
      awayScore++;
      const scorer = pickScorer(awayXI);
      events.push({
        minute,
        half,
        type: 'goal',
        playerId: scorer.id,
        playerName: scorer.name,
        team: 'away',
        score: `${homeScore}x${awayScore}`,
      });
    }

    // Yellow card (~4 per game total)
    if (Math.random() < 0.022) {
      const team: 'home' | 'away' = Math.random() < 0.5 ? 'home' : 'away';
      const xi = team === 'home' ? homeXI : awayXI;
      if (xi.length > 0) {
        const player = xi[Math.floor(Math.random() * xi.length)];
        events.push({
          minute,
          half,
          type: 'yellow_card',
          playerId: player.id,
          playerName: player.name,
          team,
          score: `${homeScore}x${awayScore}`,
        });
      }
    }
  }

  return events;
}

