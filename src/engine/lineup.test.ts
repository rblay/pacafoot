import { describe, it, expect } from 'vitest';
import { autoLineup, detectFormation } from './lineup';
import type { Player } from '../types';

function makePlayer(id: string, position: Player['position'], rating: number): Player {
  return {
    id, name: id, teamId: 'test', position, rating,
    age: 25, nationality: 'BR', salary: 1000,
    passRating: rating, energy: 100, role: 'Normal',
    characteristics: [], goals: 0, yellowCards: 0,
    redCards: 0, matchesPlayed: 0,
  };
}

const squad = [
  makePlayer('g1', 'G', 70),
  makePlayer('l1', 'L', 80), makePlayer('l2', 'L', 75),
  makePlayer('z1', 'Z', 82), makePlayer('z2', 'Z', 78), makePlayer('z3', 'Z', 74),
  makePlayer('m1', 'M', 85), makePlayer('m2', 'M', 83), makePlayer('m3', 'M', 81),
  makePlayer('m4', 'M', 79), makePlayer('m5', 'M', 76),
  makePlayer('a1', 'A', 88), makePlayer('a2', 'A', 86), makePlayer('a3', 'A', 84),
];

describe('autoLineup', () => {
  it('always returns exactly 11 starters', () => {
    const result = autoLineup(squad, '4-4-2');
    expect(result.startingXI).toHaveLength(11);
  });

  it('no player appears in both starters and subs', () => {
    const result = autoLineup(squad, '4-3-3');
    const starterSet = new Set(result.startingXI);
    for (const id of result.subs) {
      expect(starterSet.has(id)).toBe(false);
    }
  });

  it('4-4-2: picks 1G 2L 2Z 4M 2A', () => {
    const result = autoLineup(squad, '4-4-2');
    const starters = squad.filter(p => result.startingXI.includes(p.id));
    expect(starters.filter(p => p.position === 'G')).toHaveLength(1);
    expect(starters.filter(p => p.position === 'L')).toHaveLength(2);
    expect(starters.filter(p => p.position === 'Z')).toHaveLength(2);
    expect(starters.filter(p => p.position === 'M')).toHaveLength(4);
    expect(starters.filter(p => p.position === 'A')).toHaveLength(2);
  });

  it('4-3-3: picks 1G 2L 2Z 3M 3A', () => {
    const result = autoLineup(squad, '4-3-3');
    const starters = squad.filter(p => result.startingXI.includes(p.id));
    expect(starters.filter(p => p.position === 'L')).toHaveLength(2);
    expect(starters.filter(p => p.position === 'Z')).toHaveLength(2);
    expect(starters.filter(p => p.position === 'M')).toHaveLength(3);
    expect(starters.filter(p => p.position === 'A')).toHaveLength(3);
  });

  it('3-5-2: picks 1G 0L 3Z 5M 2A', () => {
    const result = autoLineup(squad, '3-5-2');
    const starters = squad.filter(p => result.startingXI.includes(p.id));
    expect(starters.filter(p => p.position === 'L')).toHaveLength(0);
    expect(starters.filter(p => p.position === 'Z')).toHaveLength(3);
    expect(starters.filter(p => p.position === 'M')).toHaveLength(5);
    expect(starters.filter(p => p.position === 'A')).toHaveLength(2);
  });

  it('5-4-1: picks 1G 2L 3Z 4M 1A', () => {
    const result = autoLineup(squad, '5-4-1');
    const starters = squad.filter(p => result.startingXI.includes(p.id));
    expect(starters.filter(p => p.position === 'L')).toHaveLength(2);
    expect(starters.filter(p => p.position === 'Z')).toHaveLength(3);
    expect(starters.filter(p => p.position === 'M')).toHaveLength(4);
    expect(starters.filter(p => p.position === 'A')).toHaveLength(1);
  });

  it('5-3-2: picks 1G 2L 3Z 3M 2A', () => {
    const result = autoLineup(squad, '5-3-2');
    const starters = squad.filter(p => result.startingXI.includes(p.id));
    expect(starters.filter(p => p.position === 'L')).toHaveLength(2);
    expect(starters.filter(p => p.position === 'Z')).toHaveLength(3);
    expect(starters.filter(p => p.position === 'M')).toHaveLength(3);
    expect(starters.filter(p => p.position === 'A')).toHaveLength(2);
  });

  it('selects the highest-rated players at each position', () => {
    const result = autoLineup(squad, '4-4-2');
    // Best 2 attackers should be a1 (88) and a2 (86), not a3 (84)
    expect(result.startingXI).toContain('a1');
    expect(result.startingXI).toContain('a2');
    expect(result.startingXI).not.toContain('a3');
    // Best Z should be z1 (82) and z2 (78), not z3 (74)
    expect(result.startingXI).toContain('z1');
    expect(result.startingXI).toContain('z2');
    expect(result.startingXI).not.toContain('z3');
  });

  it('subs are sorted by rating descending', () => {
    const result = autoLineup(squad, '4-4-2');
    const subPlayers = squad.filter(p => result.subs.includes(p.id));
    const subRatings = result.subs.map(id => subPlayers.find(p => p.id === id)!.rating);
    for (let i = 0; i < subRatings.length - 1; i++) {
      expect(subRatings[i]).toBeGreaterThanOrEqual(subRatings[i + 1]);
    }
  });
});

describe('detectFormation', () => {
  const xi442 = [
    makePlayer('g', 'G', 70),
    makePlayer('l1', 'L', 70), makePlayer('l2', 'L', 70),
    makePlayer('z1', 'Z', 70), makePlayer('z2', 'Z', 70),
    makePlayer('m1', 'M', 70), makePlayer('m2', 'M', 70), makePlayer('m3', 'M', 70), makePlayer('m4', 'M', 70),
    makePlayer('a1', 'A', 70), makePlayer('a2', 'A', 70),
  ];

  it('detects 4-4-2', () => {
    expect(detectFormation(xi442)).toBe('4-4-2');
  });

  it('detects 4-3-3', () => {
    const xi433 = [
      makePlayer('g', 'G', 70),
      makePlayer('l1', 'L', 70), makePlayer('l2', 'L', 70),
      makePlayer('z1', 'Z', 70), makePlayer('z2', 'Z', 70),
      makePlayer('m1', 'M', 70), makePlayer('m2', 'M', 70), makePlayer('m3', 'M', 70),
      makePlayer('a1', 'A', 70), makePlayer('a2', 'A', 70), makePlayer('a3', 'A', 70),
    ];
    expect(detectFormation(xi433)).toBe('4-3-3');
  });

  it('detects 5-4-1', () => {
    const xi541 = [
      makePlayer('g', 'G', 70),
      makePlayer('l1', 'L', 70), makePlayer('l2', 'L', 70),
      makePlayer('z1', 'Z', 70), makePlayer('z2', 'Z', 70), makePlayer('z3', 'Z', 70),
      makePlayer('m1', 'M', 70), makePlayer('m2', 'M', 70), makePlayer('m3', 'M', 70), makePlayer('m4', 'M', 70),
      makePlayer('a1', 'A', 70),
    ];
    expect(detectFormation(xi541)).toBe('5-4-1');
  });

  it('returns custom for unrecognised combination', () => {
    const weird = [
      makePlayer('g', 'G', 70),
      makePlayer('z1', 'Z', 70), makePlayer('z2', 'Z', 70),
      makePlayer('m1', 'M', 70), makePlayer('m2', 'M', 70), makePlayer('m3', 'M', 70),
      makePlayer('m4', 'M', 70), makePlayer('m5', 'M', 70), makePlayer('m6', 'M', 70),
      makePlayer('a1', 'A', 70), makePlayer('a2', 'A', 70),
    ];
    expect(detectFormation(weird)).toBe('custom');
  });

  it('returns custom when fewer than 11 players', () => {
    expect(detectFormation(xi442.slice(0, 10))).toBe('custom');
  });
});
