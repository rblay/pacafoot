import type { Player, MatchEvent, MatchResult, LineupSelection } from '../types';
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
