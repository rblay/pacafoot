import { describe, it, expect } from 'vitest';
import { generateSchedule } from './fixtures';

// Use a small even-numbered league for fast structural checks,
// plus the real 20-team case for the full Serie A scenario.
const TEAMS_4 = ['A', 'B', 'C', 'D'];
const TEAMS_20 = Array.from({ length: 20 }, (_, i) => `team${i}`);

describe('generateSchedule', () => {
  describe('structure', () => {
    it('produces 2*(n-1) rounds for n teams', () => {
      expect(generateSchedule(TEAMS_4)).toHaveLength(6);   // 4 teams → 6 rounds
      expect(generateSchedule(TEAMS_20)).toHaveLength(38); // 20 teams → 38 rounds
    });

    it('produces n/2 fixtures per round', () => {
      const schedule4 = generateSchedule(TEAMS_4);
      schedule4.forEach(round => expect(round).toHaveLength(2));

      const schedule20 = generateSchedule(TEAMS_20);
      schedule20.forEach(round => expect(round).toHaveLength(10));
    });

    it('throws for an odd number of teams', () => {
      expect(() => generateSchedule(['A', 'B', 'C'])).toThrow();
    });

    it('throws for fewer than 2 teams', () => {
      expect(() => generateSchedule([])).toThrow();
      expect(() => generateSchedule(['A'])).toThrow();
    });
  });

  describe('correctness — 4 teams', () => {
    const schedule = generateSchedule(TEAMS_4);

    it('every team plays exactly once per round', () => {
      for (const round of schedule) {
        const seen = new Set<string>();
        for (const [h, a] of round) {
          expect(seen.has(h)).toBe(false);
          expect(seen.has(a)).toBe(false);
          seen.add(h);
          seen.add(a);
        }
        expect(seen.size).toBe(TEAMS_4.length);
      }
    });

    it('each ordered pair (home, away) appears exactly once across the season', () => {
      const directedCount: Record<string, number> = {};
      for (const round of schedule) {
        for (const [h, a] of round) {
          const key = `${h}->${a}`;
          directedCount[key] = (directedCount[key] ?? 0) + 1;
        }
      }
      for (const count of Object.values(directedCount)) {
        expect(count).toBe(1);
      }
    });

    it('each pair of teams plays exactly twice (once each way)', () => {
      const pairCount: Record<string, number> = {};
      for (const round of schedule) {
        for (const [h, a] of round) {
          const key = [h, a].sort().join('-');
          pairCount[key] = (pairCount[key] ?? 0) + 1;
        }
      }
      expect(Object.keys(pairCount)).toHaveLength(6); // C(4,2) = 6 unique pairs
      for (const count of Object.values(pairCount)) {
        expect(count).toBe(2);
      }
    });

    it('every team plays at home exactly (n-1) times and away exactly (n-1) times', () => {
      const homeCount: Record<string, number> = {};
      const awayCount: Record<string, number> = {};
      for (const round of schedule) {
        for (const [h, a] of round) {
          homeCount[h] = (homeCount[h] ?? 0) + 1;
          awayCount[a] = (awayCount[a] ?? 0) + 1;
        }
      }
      for (const team of TEAMS_4) {
        expect(homeCount[team]).toBe(TEAMS_4.length - 1);
        expect(awayCount[team]).toBe(TEAMS_4.length - 1);
      }
    });
  });

  describe('correctness — 20 teams (Serie A)', () => {
    const schedule = generateSchedule(TEAMS_20);

    it('every team plays exactly once per round', () => {
      for (const round of schedule) {
        const seen = new Set<string>();
        for (const [h, a] of round) {
          expect(seen.has(h)).toBe(false);
          expect(seen.has(a)).toBe(false);
          seen.add(h);
          seen.add(a);
        }
        expect(seen.size).toBe(20);
      }
    });

    it('each ordered pair appears exactly once', () => {
      const directedCount: Record<string, number> = {};
      for (const round of schedule) {
        for (const [h, a] of round) {
          const key = `${h}->${a}`;
          directedCount[key] = (directedCount[key] ?? 0) + 1;
        }
      }
      for (const count of Object.values(directedCount)) {
        expect(count).toBe(1);
      }
      // 20 teams: 20*19 = 380 directed fixtures
      expect(Object.keys(directedCount)).toHaveLength(380);
    });

    it('each team plays exactly 38 matches total (19 home, 19 away)', () => {
      const homeCount: Record<string, number> = {};
      const awayCount: Record<string, number> = {};
      for (const round of schedule) {
        for (const [h, a] of round) {
          homeCount[h] = (homeCount[h] ?? 0) + 1;
          awayCount[a] = (awayCount[a] ?? 0) + 1;
        }
      }
      for (const team of TEAMS_20) {
        expect(homeCount[team]).toBe(19);
        expect(awayCount[team]).toBe(19);
      }
    });
  });

  describe('determinism', () => {
    it('produces the same schedule for the same input', () => {
      const s1 = generateSchedule([...TEAMS_20]);
      const s2 = generateSchedule([...TEAMS_20]);
      expect(JSON.stringify(s1)).toBe(JSON.stringify(s2));
    });

    it('produces different schedules for different team orderings', () => {
      const s1 = generateSchedule(['A', 'B', 'C', 'D']);
      const s2 = generateSchedule(['D', 'C', 'B', 'A']);
      // Structure is the same but fixture assignments differ
      expect(JSON.stringify(s1)).not.toBe(JSON.stringify(s2));
    });
  });
});
