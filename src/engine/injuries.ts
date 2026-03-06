import type { MatchResult, PlayerSeasonStats } from '../types';

const DEFAULT_STATS: PlayerSeasonStats = {
  goals: 0,
  yellowCards: 0,
  redCards: 0,
  matchesPlayed: 0,
  energy: 100,
};

/** Returns true if the player cannot play in currentRound due to injury. */
export function isInjured(stats: PlayerSeasonStats | undefined, currentRound: number): boolean {
  return stats?.injuredUntilRound !== undefined && currentRound <= stats.injuredUntilRound;
}

/**
 * Scans injury events from a completed set of round results and returns an updated
 * playerStats record with injured players marked as unavailable for upcoming rounds.
 * Injury duration: 1–4 rounds (uniform random, seeded at call time).
 */
export function applyMatchInjuries(
  playerStats: Record<string, PlayerSeasonStats>,
  roundResults: MatchResult[],
  nextRound: number,
  randomFn: () => number = Math.random,
): Record<string, PlayerSeasonStats> {
  const updated: Record<string, PlayerSeasonStats> = { ...playerStats };

  for (const result of roundResults) {
    for (const event of result.events) {
      if (event.type !== 'injury') continue;
      const id = event.playerId;
      const prev = updated[id] ?? { ...DEFAULT_STATS };
      const duration = Math.floor(randomFn() * 4) + 1; // 1–4 rounds
      updated[id] = { ...prev, injuredUntilRound: nextRound + duration - 1 };
    }
  }

  return updated;
}
