import type { Team, Player } from '../types';

const DATA_BASE_PATH = `${import.meta.env.BASE_URL}data/leagues/serie_a`;

export async function loadTeams(): Promise<Team[]> {
  const response = await fetch(`${DATA_BASE_PATH}/teams.json`);
  if (!response.ok) {
    throw new Error(`Failed to load teams: ${response.statusText}`);
  }
  return response.json();
}

export async function loadPlayers(): Promise<Player[]> {
  const response = await fetch(`${DATA_BASE_PATH}/players.json`);
  if (!response.ok) {
    throw new Error(`Failed to load players: ${response.statusText}`);
  }
  return response.json();
}

export function getTeamPlayers(players: Player[], teamId: string): Player[] {
  return players.filter(p => p.teamId === teamId);
}

export function getPlayerById(players: Player[], playerId: string): Player | undefined {
  return players.find(p => p.id === playerId);
}

export function getTeamById(teams: Team[], teamId: string): Team | undefined {
  return teams.find(t => t.id === teamId);
}
