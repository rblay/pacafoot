import type { MatchResult, PlayerSeasonStats } from '../types';

export const YELLOW_SUSPENSION_THRESHOLD = 3;

const DEFAULT_STATS: PlayerSeasonStats = {
  goals: 0,
  yellowCards: 0,
  redCards: 0,
  matchesPlayed: 0,
  energy: 100,
};

/** Returns true if the player cannot play in currentRound due to a suspension. */
export function isSuspended(stats: PlayerSeasonStats | undefined, currentRound: number): boolean {
  return stats?.suspendedForRound === currentRound;
}

/**
 * Scans card events from a completed set of round results and returns an updated
 * playerStats record. nextRound is the upcoming round (suspension target).
 * Also resets yellow card count for players who have just served their suspension.
 */
export function applyMatchCards(
  playerStats: Record<string, PlayerSeasonStats>,
  roundResults: MatchResult[],
  nextRound: number,
): Record<string, PlayerSeasonStats> {
  // Reset yellows for any player whose suspension was just served
  const updated: Record<string, PlayerSeasonStats> = {};
  for (const [id, stats] of Object.entries(playerStats)) {
    if (stats.suspendedForRound !== undefined && stats.suspendedForRound < nextRound) {
      updated[id] = { ...stats, yellowCards: 0, suspendedForRound: undefined };
    } else {
      updated[id] = stats;
    }
  }

  for (const result of roundResults) {
    for (const event of result.events) {
      if (event.type !== 'yellow_card' && event.type !== 'red_card') continue;

      const id = event.playerId;
      const prev = updated[id] ?? { ...DEFAULT_STATS };
      const next = { ...prev };

      if (event.type === 'yellow_card') {
        next.yellowCards += 1;
        if (next.yellowCards % YELLOW_SUSPENSION_THRESHOLD === 0) {
          next.suspendedForRound = nextRound;
        }
      } else {
        next.redCards += 1;
        next.suspendedForRound = nextRound;
      }

      updated[id] = next;
    }
  }

  return updated;
}
