import type { SaveData, GameState, GameSettings, LeagueTableEntry, Team } from '../types';

const SAVE_KEY = 'pacafoot_save';

export function saveGame(gameState: GameState, settings: GameSettings): void {
  const saveData: SaveData = {
    gameState,
    settings,
    lastSaved: Date.now(),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

export function loadGame(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/** Create initial league table with all stats at 0 */
export function createInitialLeagueTable(teams: Team[]): LeagueTableEntry[] {
  return teams.map((team, index) => ({
    teamId: team.id,
    position: index + 1,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }));
}

/** Sort league table by points, then goal difference, then goals for */
export function sortLeagueTable(table: LeagueTableEntry[]): LeagueTableEntry[] {
  const sorted = [...table].sort((a, b) => {
    // Points descending
    if (b.points !== a.points) return b.points - a.points;
    // Goal difference descending
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    // Goals for descending
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // Wins descending
    return b.won - a.won;
  });
  return sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
}

/** Create default game state */
export function createDefaultGameState(teams: Team[]): GameState {
  return {
    leagueTable: createInitialLeagueTable(teams),
    currentRound: 1,
    matchResults: [],
    selectedTeamId: teams[0]?.id ?? '',
    teamLineups: {},
    teamTactics: {},
    playerStats: {},
  };
}

/** Create default settings */
export function createDefaultSettings(): GameSettings {
  return {
    language: 'pt',
  };
}
