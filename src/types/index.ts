/** Player position codes */
export type Position = 'G' | 'L' | 'Z' | 'M' | 'A';

/** Player role/function */
export type PlayerRole = 'Ofensivo' | 'Normal' | 'Volante' | 'Defensivo';

/** Tactical formation */
export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-5-1' | '3-4-3' | '5-4-1' | '5-3-2' | 'custom';

/** Play style */
export type PlayStyle = 'Defensivo' | 'Equilibrado' | 'Ofensivo';

/** Attack focus */
export type AttackFocus = 'Alas' | 'Centro' | 'Ambos';

/** Pressing intensity */
export type Pressing = 'Baixa' | 'Média' | 'Alta';

/** Player data from JSON */
export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: Position;
  rating: number;
  age: number;
  nationality: string;
  salary: number;
  passRating: number;
  energy: number;
  role: PlayerRole;
  characteristics: string[];
  goals: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
}

/** Team data from JSON */
export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  stadium: string;
  coach: string;
  capacity: number;
}

/** League table row */
export interface LeagueTableEntry {
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

/** Match event types */
export type MatchEventType = 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'injury';

/** Single match event */
export interface MatchEvent {
  minute: number;
  half: 1 | 2;
  type: MatchEventType;
  playerId: string;
  playerName: string;
  team: 'home' | 'away';
  /** Running score at moment of event, e.g. "1x0" */
  score: string;
  /** For substitution events: the player being subbed off */
  playerOutId?: string;
  playerOutName?: string;
}

/** A pre-planned substitution for use in simulateSegment */
export interface PlannedSub {
  minute: number;
  playerOut: string; // player ID
  playerIn: string;  // player ID
}

/** Full match result */
export interface MatchResult {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  homeLineup: LineupSelection;
  awayLineup: LineupSelection;
  attendance: number;
  stadium: string;
}

/** Team lineup selection */
export interface LineupSelection {
  startingXI: string[]; // player IDs
  subs: string[];       // player IDs
}

/** Tactical configuration */
export interface TacticalConfig {
  formation: Formation;
  playStyle: PlayStyle;
  attackFocus: AttackFocus;
  pressing: Pressing;
}

/** Full game state for save/load */
export interface GameState {
  leagueTable: LeagueTableEntry[];
  currentRound: number;
  matchResults: MatchResult[];
  selectedTeamId: string;
  teamLineups: Record<string, LineupSelection>;
  teamTactics: Record<string, TacticalConfig>;
  /** Player stats that change during the season */
  playerStats: Record<string, PlayerSeasonStats>;
}

/** Per-player season stats (mutable) */
export interface PlayerSeasonStats {
  goals: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
  energy: number;
  /** Round the player is suspended and cannot play */
  suspendedForRound?: number;
  /** Round until which the player is injured and cannot play (exclusive — player returns when currentRound > injuredUntilRound) */
  injuredUntilRound?: number;
}

/** Save file structure */
export interface SaveData {
  gameState: GameState;
  settings: GameSettings;
  lastSaved: number; // timestamp
}

/** Game settings */
export interface GameSettings {
  language: 'pt' | 'en';
}

/** Navigation views */
export type ViewType = 'start' | 'league' | 'team' | 'match_result' | 'squad_view' | 'season_end';

/** App-level state */
export interface AppState {
  currentView: ViewType;
  gameState: GameState;
  settings: GameSettings;
  teams: Team[];
  players: Player[];
  /** Which team's detail view to show */
  viewingTeamId: string | null;
  /** Current match result being displayed */
  currentMatchResult: MatchResult | null;
}
