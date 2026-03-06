import { describe, it, expect } from 'vitest';
import { isInjured, applyMatchInjuries } from './injuries';
import type { MatchResult, PlayerSeasonStats } from '../types';

const baseStats: PlayerSeasonStats = {
  goals: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, energy: 100,
};

const baseResult: Omit<MatchResult, 'events'> = {
  round: 5,
  homeTeamId: 'a', awayTeamId: 'b',
  homeScore: 1, awayScore: 0,
  homeLineup: { startingXI: [], subs: [] },
  awayLineup: { startingXI: [], subs: [] },
  attendance: 10000, stadium: 'S',
};

describe('isInjured', () => {
  it('returns false when no stats', () => {
    expect(isInjured(undefined, 5)).toBe(false);
  });

  it('returns false when no injuredUntilRound', () => {
    expect(isInjured({ ...baseStats }, 5)).toBe(false);
  });

  it('returns true when currentRound <= injuredUntilRound', () => {
    expect(isInjured({ ...baseStats, injuredUntilRound: 7 }, 7)).toBe(true);
    expect(isInjured({ ...baseStats, injuredUntilRound: 7 }, 6)).toBe(true);
  });

  it('returns false when currentRound > injuredUntilRound (recovered)', () => {
    expect(isInjured({ ...baseStats, injuredUntilRound: 7 }, 8)).toBe(false);
  });
});

describe('applyMatchInjuries', () => {
  it('sets injuredUntilRound for injured players', () => {
    const results: MatchResult[] = [{
      ...baseResult,
      events: [{
        minute: 30, half: 1, type: 'injury',
        playerId: 'p1', playerName: 'Player 1',
        team: 'home', score: '0x0',
      }],
    }];
    // Always returns 1 round injury for determinism
    const updated = applyMatchInjuries({}, results, 6, () => 0);
    expect(updated['p1'].injuredUntilRound).toBe(6); // nextRound + 1 - 1 = 6
  });

  it('supports multi-round injuries based on randomFn', () => {
    const results: MatchResult[] = [{
      ...baseResult,
      events: [{
        minute: 55, half: 2, type: 'injury',
        playerId: 'p2', playerName: 'Player 2',
        team: 'away', score: '1x0',
      }],
    }];
    // randomFn returning 0.75 → floor(0.75*4)+1 = 4 rounds
    const updated = applyMatchInjuries({}, results, 10, () => 0.75);
    expect(updated['p2'].injuredUntilRound).toBe(13); // 10 + 4 - 1
  });

  it('does not modify stats for non-injury events', () => {
    const results: MatchResult[] = [{
      ...baseResult,
      events: [{
        minute: 20, half: 1, type: 'goal',
        playerId: 'p3', playerName: 'Player 3',
        team: 'home', score: '1x0',
      }],
    }];
    const updated = applyMatchInjuries({ p3: { ...baseStats } }, results, 6);
    expect(updated['p3'].injuredUntilRound).toBeUndefined();
  });

  it('preserves existing stats when applying injury', () => {
    const existing: PlayerSeasonStats = { ...baseStats, goals: 5, yellowCards: 2 };
    const results: MatchResult[] = [{
      ...baseResult,
      events: [{
        minute: 10, half: 1, type: 'injury',
        playerId: 'p4', playerName: 'P4',
        team: 'home', score: '0x0',
      }],
    }];
    const updated = applyMatchInjuries({ p4: existing }, results, 3, () => 0);
    expect(updated['p4'].goals).toBe(5);
    expect(updated['p4'].yellowCards).toBe(2);
    expect(updated['p4'].injuredUntilRound).toBe(3);
  });
});
