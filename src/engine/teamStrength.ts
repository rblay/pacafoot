import type { Player, Position } from '../types';

/**
 * Position weight multipliers for team strength calculation.
 * Attackers contribute most to team rating, goalkeepers least.
 * A=1.4x, M=1.1x, Z/L=0.9x, G=0.5x
 */
const POSITION_WEIGHTS: Record<Position, number> = {
  A: 1.4,
  M: 1.1,
  Z: 0.9,
  L: 0.9,
  G: 0.5,
};

/** Calculate weighted team strength from a lineup of players */
export function calculateTeamStrength(players: Player[]): number {
  if (players.length === 0) return 0;

  let totalWeightedRating = 0;
  let totalWeight = 0;

  for (const player of players) {
    const weight = POSITION_WEIGHTS[player.position];
    totalWeightedRating += player.rating * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalWeightedRating / totalWeight : 0;
}

/** Get attack strength (weighted towards attackers and midfielders) */
export function calculateAttackStrength(players: Player[]): number {
  const attackers = players.filter(p => p.position === 'A' || p.position === 'M');
  if (attackers.length === 0) return 0;
  return attackers.reduce((sum, p) => sum + p.rating, 0) / attackers.length;
}

/** Get defense strength (weighted towards defenders and goalkeeper) */
export function calculateDefenseStrength(players: Player[]): number {
  const defenders = players.filter(p => p.position === 'G' || p.position === 'Z' || p.position === 'L');
  if (defenders.length === 0) return 0;
  return defenders.reduce((sum, p) => sum + p.rating, 0) / defenders.length;
}
