import { describe, it, expect } from 'vitest';
import { applyMatchCards, isSuspended, YELLOW_SUSPENSION_THRESHOLD } from './suspensions';
import type { MatchResult, PlayerSeasonStats } from '../types';

function makeResult(events: MatchResult['events']): MatchResult {
  return {
    round: 1,
    homeTeamId: 'team-a',
    awayTeamId: 'team-b',
    homeScore: 0,
    awayScore: 0,
    events,
    homeLineup: { startingXI: [], subs: [] },
    awayLineup: { startingXI: [], subs: [] },
    attendance: 10000,
    stadium: 'Test Stadium',
  };
}

function makeYellow(playerId: string, playerName = 'Player'): MatchResult['events'][0] {
  return { minute: 30, half: 1, type: 'yellow_card', playerId, playerName, team: 'home', score: '0x0' };
}

function makeRed(playerId: string, playerName = 'Player'): MatchResult['events'][0] {
  return { minute: 60, half: 2, type: 'red_card', playerId, playerName, team: 'home', score: '0x0' };
}

describe('isSuspended', () => {
  it('returns false for undefined stats', () => {
    expect(isSuspended(undefined, 5)).toBe(false);
  });

  it('returns false when suspendedForRound is not set', () => {
    const stats: PlayerSeasonStats = { goals: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, energy: 100 };
    expect(isSuspended(stats, 5)).toBe(false);
  });

  it('returns true when current round matches suspendedForRound', () => {
    const stats: PlayerSeasonStats = { goals: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, energy: 100, suspendedForRound: 5 };
    expect(isSuspended(stats, 5)).toBe(true);
  });

  it('returns false when suspension was for a previous round', () => {
    const stats: PlayerSeasonStats = { goals: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, energy: 100, suspendedForRound: 4 };
    expect(isSuspended(stats, 5)).toBe(false);
  });

  it('returns false when suspension is for a future round', () => {
    const stats: PlayerSeasonStats = { goals: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, energy: 100, suspendedForRound: 6 };
    expect(isSuspended(stats, 5)).toBe(false);
  });
});

describe('applyMatchCards', () => {
  it('creates a stats entry for a new player who received a yellow card', () => {
    const result = applyMatchCards({}, [makeResult([makeYellow('p1')])], 2);
    expect(result['p1'].yellowCards).toBe(1);
  });

  it('increments yellow cards for an existing player', () => {
    const initial = { p1: { goals: 0, yellowCards: 1, redCards: 0, matchesPlayed: 5, energy: 100 } };
    const result = applyMatchCards(initial, [makeResult([makeYellow('p1')])], 2);
    expect(result['p1'].yellowCards).toBe(2);
  });

  it(`suspends player on ${YELLOW_SUSPENSION_THRESHOLD}th yellow card`, () => {
    const initial = { p1: { goals: 0, yellowCards: YELLOW_SUSPENSION_THRESHOLD - 1, redCards: 0, matchesPlayed: 5, energy: 100 } };
    const result = applyMatchCards(initial, [makeResult([makeYellow('p1')])], 6);
    expect(result['p1'].yellowCards).toBe(YELLOW_SUSPENSION_THRESHOLD);
    expect(result['p1'].suspendedForRound).toBe(6);
  });

  it('does not suspend player below the yellow card threshold', () => {
    const initial = { p1: { goals: 0, yellowCards: YELLOW_SUSPENSION_THRESHOLD - 2, redCards: 0, matchesPlayed: 5, energy: 100 } };
    const result = applyMatchCards(initial, [makeResult([makeYellow('p1')])], 6);
    expect(result['p1'].suspendedForRound).toBeUndefined();
  });

  it('suspends player immediately for a red card', () => {
    const result = applyMatchCards({}, [makeResult([makeRed('p1')])], 5);
    expect(result['p1'].redCards).toBe(1);
    expect(result['p1'].suspendedForRound).toBe(5);
  });

  it('handles multiple results in the same round', () => {
    const results = [
      makeResult([makeYellow('p1')]),
      makeResult([makeRed('p2')]),
    ];
    const result = applyMatchCards({}, results, 3);
    expect(result['p1'].yellowCards).toBe(1);
    expect(result['p1'].suspendedForRound).toBeUndefined();
    expect(result['p2'].redCards).toBe(1);
    expect(result['p2'].suspendedForRound).toBe(3);
  });

  it('does not double-suspend a player who gets yellow and red in same round', () => {
    const events = [makeYellow('p1'), makeRed('p1')];
    const result = applyMatchCards({}, [makeResult(events)], 4);
    expect(result['p1'].suspendedForRound).toBe(4);
  });

  it('preserves existing stats for players not in any result', () => {
    const initial = { p99: { goals: 5, yellowCards: 1, redCards: 0, matchesPlayed: 10, energy: 80 } };
    const result = applyMatchCards(initial, [makeResult([makeYellow('p1')])], 2);
    expect(result['p99']).toEqual(initial['p99']);
  });

  it('resets yellow cards after suspension is served', () => {
    const initial = { p1: { goals: 0, yellowCards: YELLOW_SUSPENSION_THRESHOLD, redCards: 0, matchesPlayed: 5, energy: 100, suspendedForRound: 7 } };
    // nextRound=8 means round 7 was just played (suspension served)
    const result = applyMatchCards(initial, [], 8);
    expect(result['p1'].yellowCards).toBe(0);
    expect(result['p1'].suspendedForRound).toBeUndefined();
  });

  it('does not reset yellows for a future suspension', () => {
    const initial = { p1: { goals: 0, yellowCards: YELLOW_SUSPENSION_THRESHOLD, redCards: 0, matchesPlayed: 5, energy: 100, suspendedForRound: 9 } };
    const result = applyMatchCards(initial, [], 8);
    expect(result['p1'].yellowCards).toBe(YELLOW_SUSPENSION_THRESHOLD);
    expect(result['p1'].suspendedForRound).toBe(9);
  });
});
