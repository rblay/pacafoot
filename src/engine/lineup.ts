import type { Formation, LineupSelection, Player, Position } from '../types';

interface PositionRequirements {
  G: number;
  L: number;
  Z: number;
  M: number;
  A: number;
}

/**
 * Parse a formation string into position slot counts.
 * Convention: first number = defenders, middle numbers = midfielders, last = attackers.
 * 5-back / 4-back → 2L + rest Z; 3-back → 3Z (no fullbacks).
 */
function parseFormation(formation: Formation): PositionRequirements {
  if (formation === 'custom') return { G: 1, L: 2, Z: 2, M: 4, A: 2 }; // fallback, should not be called
  const parts = formation.split('-').map(Number);
  const defCount = parts[0];
  const midCount = parts.slice(1, -1).reduce((sum, n) => sum + n, 0);
  const attCount = parts[parts.length - 1];

  // 4-back: 2 wing-backs (L) + 2 CBs (Z); 5-back: 2 wing-backs (L) + 3 CBs (Z); 3-back: 3 CBs only
  const lCount = defCount >= 4 ? 2 : 0;
  const zCount = defCount - lCount;

  return { G: 1, L: lCount, Z: zCount, M: midCount, A: attCount };
}

/**
 * Infer the formation from the current set of 11 starters.
 * Returns 'custom' if the combination doesn't match any known formation.
 */
export function detectFormation(starters: Player[]): Formation {
  if (starters.length !== 11) return 'custom';
  if (starters.filter(p => p.position === 'G').length !== 1) return 'custom';

  const defCount = starters.filter(p => p.position === 'L' || p.position === 'Z').length;
  const midCount = starters.filter(p => p.position === 'M').length;
  const attCount = starters.filter(p => p.position === 'A').length;

  const map: [number, number, number, Formation][] = [
    [4, 4, 2, '4-4-2'],
    [4, 3, 3, '4-3-3'],
    [3, 5, 2, '3-5-2'],
    [4, 5, 1, '4-5-1'],
    [3, 4, 3, '3-4-3'],
    [5, 4, 1, '5-4-1'],
    [5, 3, 2, '5-3-2'],
  ];

  const match = map.find(([d, m, a]) => d === defCount && m === midCount && a === attCount);
  return match ? match[3] : 'custom';
}

/**
 * Build the best possible lineup for a given formation.
 * Picks highest-rated available players for each position slot.
 * Remaining players fill the bench, also sorted by rating.
 */
export function autoLineup(players: Player[], formation: Formation): LineupSelection {
  const reqs = parseFormation(formation);

  const byPosition: Record<Position, Player[]> = { G: [], L: [], Z: [], M: [], A: [] };
  for (const player of players) {
    byPosition[player.position].push(player);
  }

  const positions: Position[] = ['G', 'L', 'Z', 'M', 'A'];
  for (const pos of positions) {
    byPosition[pos].sort((a, b) => b.rating - a.rating);
  }

  const starters: Player[] = [];
  for (const pos of positions) {
    starters.push(...byPosition[pos].slice(0, reqs[pos]));
  }

  const starterIds = new Set(starters.map(p => p.id));
  const subs = players
    .filter(p => !starterIds.has(p.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  return {
    startingXI: starters.map(p => p.id),
    subs: subs.map(p => p.id),
  };
}
