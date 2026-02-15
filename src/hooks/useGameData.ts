import { useState, useEffect } from 'react';
import type { Team, Player, GameState, GameSettings } from '../types';
import { loadTeams, loadPlayers } from '../utils/dataLoader';
import { loadGame, createDefaultGameState, createDefaultSettings } from '../utils/storage';
import { setLanguage } from '../locales/i18n';

interface GameData {
  teams: Team[];
  players: Player[];
  gameState: GameState;
  settings: GameSettings;
  loading: boolean;
  error: string | null;
  setGameState: (state: GameState) => void;
  setSettings: (settings: GameSettings) => void;
}

export function useGameData(): GameData {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<GameSettings>(createDefaultSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [teamsData, playersData] = await Promise.all([
          loadTeams(),
          loadPlayers(),
        ]);
        setTeams(teamsData);
        setPlayers(playersData);

        // Try loading saved game
        const saved = loadGame();
        if (saved) {
          setGameState(saved.gameState);
          setSettings(saved.settings);
          setLanguage(saved.settings.language);
        } else {
          setGameState(createDefaultGameState(teamsData));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return {
    teams,
    players,
    gameState: gameState ?? createDefaultGameState(teams),
    settings,
    loading,
    error,
    setGameState,
    setSettings,
  };
}
