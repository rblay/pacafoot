import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import styles from './TeamView.module.css';
import TacticsPanel from './TacticsPanel';
import SquadList from './SquadList';
import { autoLineup, detectFormation } from '../../engine/lineup';
import type { Team, Player, TacticalConfig, Position, LineupSelection, PlayerSeasonStats } from '../../types';

interface TeamViewProps {
  team: Team;
  players: Player[];
  initialLineup?: LineupSelection;
  initialTactics?: TacticalConfig;
  suspendedIds?: Set<string>;
  injuredIds?: Set<string>;
  playerStats?: Record<string, PlayerSeasonStats>;
  currentRound?: number;
  onPlay: (starters: string[], subs: string[], tactics: TacticalConfig) => void;
}

const MAX_STARTERS = 11;
const MAX_SUBS = 12;

const DEFAULT_TACTICS: TacticalConfig = {
  formation: 'custom',
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

export default function TeamView({ team, players, initialLineup, initialTactics, suspendedIds = new Set(), injuredIds = new Set(), playerStats = {}, currentRound, onPlay }: TeamViewProps) {
  const unavailableIds = useMemo(() => new Set([...suspendedIds, ...injuredIds]), [suspendedIds, injuredIds]);
  const [selectedStarters, setSelectedStarters] = useState<Set<string>>(
    () => new Set((initialLineup?.startingXI ?? []).filter(id => !unavailableIds.has(id)))
  );
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(
    () => new Set((initialLineup?.subs ?? []).filter(id => !unavailableIds.has(id)))
  );
  const [tactics, setTactics] = useState<TacticalConfig>(() => {
    if (initialTactics) return initialTactics;
    if (initialLineup) {
      const starters = players.filter(p => initialLineup.startingXI.includes(p.id));
      return { ...DEFAULT_TACTICS, formation: detectFormation(starters) };
    }
    return DEFAULT_TACTICS;
  });
  const [limitReached, setLimitReached] = useState(false);

  // Detect formation whenever starters reach a full XI
  useEffect(() => {
    if (selectedStarters.size !== 11) return;
    const starters = players.filter(p => selectedStarters.has(p.id));
    const detected = detectFormation(starters);
    setTactics(t => ({ ...t, formation: detected }));
  }, [selectedStarters, players]);

  const handleTacticsChange = useCallback((newTactics: TacticalConfig) => {
    if (newTactics.formation !== 'custom' && newTactics.formation !== tactics.formation) {
      const available = players.filter(p => !unavailableIds.has(p.id));
      const lineup = autoLineup(available, newTactics.formation);
      setSelectedStarters(new Set(lineup.startingXI));
      setSelectedSubs(new Set(lineup.subs));
    }
    setTactics(newTactics);
  }, [tactics.formation, players, unavailableIds]);
  const limitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTogglePlayer = useCallback((playerId: string) => {
    if (unavailableIds.has(playerId)) return;
    const isStarter = selectedStarters.has(playerId);
    const isSub = selectedSubs.has(playerId);

    if (isStarter) {
      // Green → remove from starters, add to subs if room, else skip to white
      const nextStarters = new Set(selectedStarters);
      nextStarters.delete(playerId);
      setSelectedStarters(nextStarters);
      if (selectedSubs.size < MAX_SUBS) {
        const nextSubs = new Set(selectedSubs);
        nextSubs.add(playerId);
        setSelectedSubs(nextSubs);
      }
    } else if (isSub) {
      // Yellow → white (remove from subs)
      const nextSubs = new Set(selectedSubs);
      nextSubs.delete(playerId);
      setSelectedSubs(nextSubs);
    } else {
      // White → try starter, then sub, else show banner
      if (selectedStarters.size < MAX_STARTERS) {
        const nextStarters = new Set(selectedStarters);
        nextStarters.add(playerId);
        setSelectedStarters(nextStarters);
      } else if (selectedSubs.size < MAX_SUBS) {
        const nextSubs = new Set(selectedSubs);
        nextSubs.add(playerId);
        setSelectedSubs(nextSubs);
      } else {
        setLimitReached(true);
        if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
        limitTimerRef.current = setTimeout(() => setLimitReached(false), 3000);
      }
    }
  }, [selectedStarters, selectedSubs]);

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
        onTacticsChange={handleTacticsChange}
        startersCount={selectedStarters.size}
        subsCount={selectedSubs.size}
        canPlay={canPlay}
        onPlay={handlePlay}
      />
      <SquadList
        players={players}
        selectedStarters={selectedStarters}
        selectedSubs={selectedSubs}
        suspendedIds={suspendedIds}
        injuredIds={injuredIds}
        playerStats={playerStats}
        currentRound={currentRound}
        onTogglePlayer={handleTogglePlayer}
        limitReached={limitReached}
      />
    </div>
  );
}
