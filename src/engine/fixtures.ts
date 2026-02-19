export type Fixture = readonly [string, string]; // [homeId, awayId]
export type SeasonSchedule = ReadonlyArray<ReadonlyArray<Fixture>>;

/**
 * Generate a full double round-robin schedule for n teams (n must be even).
 *
 * Uses the circle method: fix team[n-1], rotate team[0..n-2] each round.
 * Returns 2*(n-1) rounds with n/2 fixtures each — so for 20 teams:
 * 38 rounds × 10 fixtures = 380 matches total.
 *
 * The same teamIds order always produces the same schedule, so sort
 * the input before calling if you need a stable result across reloads.
 */
export function generateSchedule(teamIds: string[]): SeasonSchedule {
  const n = teamIds.length;
  if (n < 2 || n % 2 !== 0) {
    throw new Error(`generateSchedule requires an even number of teams ≥ 2, got ${n}`);
  }

  const rotating = teamIds.slice(0, n - 1); // mutable, rotates each round
  const fixed = teamIds[n - 1];

  const firstHalf: Fixture[][] = [];

  for (let r = 0; r < n - 1; r++) {
    const round: Fixture[] = [];

    // Fixed team alternates home/away each round
    round.push(r % 2 === 0 ? [fixed, rotating[0]] : [rotating[0], fixed]);

    // Pair remaining slots symmetrically around the rotating array
    for (let i = 1; i < n / 2; i++) {
      const a = rotating[i];
      const b = rotating[n - 1 - i]; // rotating has n-1 elements; valid index
      round.push(r % 2 === 0 ? [a, b] : [b, a]);
    }

    firstHalf.push(round);

    // Rotate: move last element to the front
    rotating.unshift(rotating.pop()!);
  }

  // Second half: swap home/away for every fixture
  const secondHalf = firstHalf.map(round =>
    round.map<Fixture>(([h, a]) => [a, h])
  );

  return [...firstHalf, ...secondHalf];
}
