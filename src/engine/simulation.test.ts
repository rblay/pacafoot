import { describe, it, expect } from 'vitest';
import { simulateSegment, simulateMatch } from './simulation';
import type { Player, LineupSelection, PlannedSub } from '../types';

/** Build a minimal Player object for testing */
function makePlayer(id: string, position: Player['position'] = 'M', rating = 70): Player {
  return {
    id,
    name: id,
    teamId: 'team-a',
    position,
    rating,
    age: 25,
    nationality: 'BR',
    salary: 10000,
    passRating: 70,
    energy: 100,
    role: 'Normal',
    characteristics: [],
    goals: 0,
    yellowCards: 0,
    redCards: 0,
    matchesPlayed: 0,
  };
}

const homePlayers: Player[] = [
  makePlayer('h-g', 'G'),
  makePlayer('h-l1', 'L'),
  makePlayer('h-l2', 'L'),
  makePlayer('h-z1', 'Z'),
  makePlayer('h-z2', 'Z'),
  makePlayer('h-m1', 'M'),
  makePlayer('h-m2', 'M'),
  makePlayer('h-m3', 'M'),
  makePlayer('h-a1', 'A'),
  makePlayer('h-a2', 'A'),
  makePlayer('h-a3', 'A'),
  makePlayer('h-sub1', 'M'), // bench
  makePlayer('h-sub2', 'A'), // bench
];

const awayPlayers: Player[] = [
  makePlayer('a-g', 'G'),
  makePlayer('a-l1', 'L'),
  makePlayer('a-l2', 'L'),
  makePlayer('a-z1', 'Z'),
  makePlayer('a-z2', 'Z'),
  makePlayer('a-m1', 'M'),
  makePlayer('a-m2', 'M'),
  makePlayer('a-m3', 'M'),
  makePlayer('a-a1', 'A'),
  makePlayer('a-a2', 'A'),
  makePlayer('a-a3', 'A'),
  makePlayer('a-sub1', 'M'),
];

const homeLineup: LineupSelection = {
  startingXI: ['h-g', 'h-l1', 'h-l2', 'h-z1', 'h-z2', 'h-m1', 'h-m2', 'h-m3', 'h-a1', 'h-a2', 'h-a3'],
  subs: ['h-sub1', 'h-sub2'],
};

const awayLineup: LineupSelection = {
  startingXI: ['a-g', 'a-l1', 'a-l2', 'a-z1', 'a-z2', 'a-m1', 'a-m2', 'a-m3', 'a-a1', 'a-a2', 'a-a3'],
  subs: ['a-sub1'],
};

describe('simulateSegment', () => {
  it('returns only events within [fromMinute, toMinute]', () => {
    const events = simulateSegment(
      46, 90,
      'team-a', 'team-b',
      homePlayers, awayPlayers,
      homeLineup, awayLineup,
      { home: 1, away: 0 },
    );
    for (const e of events) {
      expect(e.minute).toBeGreaterThanOrEqual(46);
      expect(e.minute).toBeLessThanOrEqual(90);
    }
  });

  it('goal event scores start from currentScore', () => {
    // Run many times to ensure we get at least one goal
    let found = false;
    for (let i = 0; i < 200; i++) {
      const events = simulateSegment(
        1, 90,
        'team-a', 'team-b',
        homePlayers, awayPlayers,
        homeLineup, awayLineup,
        { home: 2, away: 1 },
      );
      const firstGoal = events.find(e => e.type === 'goal');
      if (firstGoal) {
        const [h, a] = firstGoal.score.split('x').map(Number);
        // After the first goal from 2-1, score should be either 3-1 or 2-2
        expect(h + a).toBeGreaterThanOrEqual(3); // minimum 2+1
        expect(h).toBeGreaterThanOrEqual(2);
        expect(a).toBeGreaterThanOrEqual(1);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('emits substitution event at the planned minute', () => {
    const homeSubs: PlannedSub[] = [{ minute: 60, playerOut: 'h-m1', playerIn: 'h-sub1' }];
    // Run many times to reliably get this deterministic sub event
    let subEvent = null;
    for (let i = 0; i < 30; i++) {
      const events = simulateSegment(
        46, 90,
        'team-a', 'team-b',
        homePlayers, awayPlayers,
        homeLineup, awayLineup,
        { home: 0, away: 0 },
        homeSubs,
      );
      subEvent = events.find(e => e.type === 'substitution' && e.minute === 60);
      if (subEvent) break;
    }
    expect(subEvent).not.toBeNull();
    expect(subEvent?.team).toBe('home');
    expect(subEvent?.playerName).toBe('h-sub1');
    expect(subEvent?.playerOutName).toBe('h-m1');
  });

  it('substitution event fires for away team too', () => {
    const awaySubs: PlannedSub[] = [{ minute: 70, playerOut: 'a-m1', playerIn: 'a-sub1' }];
    let subEvent = null;
    for (let i = 0; i < 30; i++) {
      const events = simulateSegment(
        46, 90,
        'team-a', 'team-b',
        homePlayers, awayPlayers,
        homeLineup, awayLineup,
        { home: 0, away: 0 },
        [],
        awaySubs,
      );
      subEvent = events.find(e => e.type === 'substitution' && e.minute === 70);
      if (subEvent) break;
    }
    expect(subEvent).not.toBeNull();
    expect(subEvent?.team).toBe('away');
  });

  it('sub outside the simulated range is not applied', () => {
    const homeSubs: PlannedSub[] = [{ minute: 30, playerOut: 'h-m1', playerIn: 'h-sub1' }];
    const events = simulateSegment(
      46, 90,
      'team-a', 'team-b',
      homePlayers, awayPlayers,
      homeLineup, awayLineup,
      { home: 0, away: 0 },
      homeSubs,
    );
    const subEvent = events.find(e => e.type === 'substitution');
    expect(subEvent).toBeUndefined();
  });

  it('returns empty array when fromMinute > toMinute', () => {
    const events = simulateSegment(
      91, 90,
      'team-a', 'team-b',
      homePlayers, awayPlayers,
      homeLineup, awayLineup,
      { home: 0, away: 0 },
    );
    expect(events).toHaveLength(0);
  });

  it('second yellow in same match produces a red card event', () => {
    // Pre-seed homeBooked with h-m1 already booked, then simulate a minute
    // where we force the yellow to fire by using a rigged segment
    // Instead: run many full segments and confirm red_card events appear over time
    let foundSecondYellow = false;
    for (let i = 0; i < 500; i++) {
      const events = simulateSegment(
        1, 90, 'team-a', 'team-b',
        homePlayers, awayPlayers, homeLineup, awayLineup,
        { home: 0, away: 0 },
        [], [], new Set(['h-m1']), // h-m1 already booked
      );
      if (events.some(e => e.type === 'red_card' && e.playerId === 'h-m1')) {
        foundSecondYellow = true;
        break;
      }
    }
    expect(foundSecondYellow).toBe(true);
  });

  it('simulateMatch produces red_card events across many simulations', () => {
    let found = false;
    for (let i = 0; i < 100; i++) {
      const result = simulateMatch(
        'team-a', 'team-b',
        homePlayers, awayPlayers,
        homeLineup, awayLineup,
        1, 'Stadium', 50000,
      );
      if (result.events.some(e => e.type === 'red_card')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});
