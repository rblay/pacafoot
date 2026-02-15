import { useState, useCallback, useMemo } from 'react';
import styles from './TeamView.module.css';
import TacticsPanel from './TacticsPanel';
import SquadList from './SquadList';
import type { Team, Player, TacticalConfig, Position } from '../../types';

interface TeamViewProps {
  team: Team;
  players: Player[];
  onPlay: (starters: string[], subs: string[], tactics: TacticalConfig) => void;
}

const MAX_STARTERS = 11;
const MAX_SUBS = 12;

const DEFAULT_TACTICS: TacticalConfig = {
  formation: '4-4-2',
  playStyle: 'Equilibrado',
  attackFocus: 'Ambos',
  pressing: 'Média',
};

/** Validate lineup: 1 GK, 3-5 DEF (Z+L), 2-5 MID, 1-3 ATK */
function validateLineup(players: Player[], starterIds: Set<string>): boolean {
  if (starterIds.size !== MAX_STARTERS) return false;

  const starters = players.filter(p => starterIds.has(p.id));
  const counts: Record<Position, number> = { G: 0, L: 0, Z: 0, M: 0, A: 0 };
  for (const p of starters) {
    counts[p.position]++;
  }

  const defCount = counts.Z + counts.L;
  return (
    counts.G === 1 &&
    defCount >= 3 && defCount <= 5 &&
    counts.M >= 2 && counts.M <= 5 &&
    counts.A >= 1 && counts.A <= 3
  );
}

export default function TeamView({ team, players, onPlay }: TeamViewProps) {
  const [selectedStarters, setSelectedStarters] = useState<Set<string>>(new Set());
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [tactics, setTactics] = useState<TacticalConfig>(DEFAULT_TACTICS);

  const handleTogglePlayer = useCallback((playerId: string) => {
    setSelectedStarters(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        // Deselect from starters
        next.delete(playerId);
        return next;
      }
      // Check if in subs
      setSelectedSubs(prevSubs => {
        if (prevSubs.has(playerId)) {
          const nextSubs = new Set(prevSubs);
          nextSubs.delete(playerId);
          return nextSubs;
        }
        return prevSubs;
      });
      // Add to starters if under limit
      if (next.size < MAX_STARTERS) {
        next.add(playerId);
        return next;
      }
      // Starters full, add to subs
      setSelectedSubs(prevSubs => {
        if (prevSubs.size < MAX_SUBS) {
          const nextSubs = new Set(prevSubs);
          nextSubs.add(playerId);
          return nextSubs;
        }
        return prevSubs;
      });
      return prev;
    });
  }, []);

  const canPlay = useMemo(
    () => validateLineup(players, selectedStarters),
    [players, selectedStarters]
  );

  const handlePlay = useCallback(() => {
    if (!canPlay) return;
    onPlay(
      Array.from(selectedStarters),
      Array.from(selectedSubs),
      tactics
    );
  }, [canPlay, selectedStarters, selectedSubs, tactics, onPlay]);

  return (
    <div className={styles.container}>
      <TacticsPanel
        team={team}
        tactics={tactics}
        onTacticsChange={setTactics}
        startersCount={selectedStarters.size}
        subsCount={selectedSubs.size}
        canPlay={canPlay}
        onPlay={handlePlay}
      />
      <SquadList
        players={players}
        selectedStarters={selectedStarters}
        selectedSubs={selectedSubs}
        onTogglePlayer={handleTogglePlayer}
      />
    </div>
  );
}
