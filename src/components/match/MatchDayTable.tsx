import styles from './MatchDayTable.module.css';
import type { MatchEvent, MatchResult as MatchResultType, Team } from '../../types';

interface MatchDayTableProps {
  playerHomeTeamId: string;
  playerAwayTeamId: string;
  playerEvents: MatchEvent[];
  otherResults: MatchResultType[];
  allTeams: Team[];
  playerTeamId: string;
  displayedMinute: number;
  isPaused: boolean;
  isFinished: boolean;
  canSub: boolean;
  round: number;
  onViewMatch: (homeTeamId: string, awayTeamId: string) => void;
  onTogglePause: () => void;
  onSubClick: () => void;
  onAdvance: () => void;
}

interface MatchEntry {
  homeTeamId: string;
  awayTeamId: string;
  events: MatchEvent[];
  isPlayerMatch: boolean;
}

function getRecentEvent(events: MatchEvent[], minute: number): MatchEvent | null {
  const ev = [...events]
    .filter(e =>
      (e.type === 'goal' || e.type === 'yellow_card' || e.type === 'red_card') &&
      e.minute <= minute
    )
    .sort((a, b) => b.minute - a.minute)[0];
  if (!ev || minute - ev.minute > 15) return null;
  return ev;
}

export default function MatchDayTable({
  playerHomeTeamId, playerAwayTeamId, playerEvents,
  otherResults, allTeams, displayedMinute,
  isPaused, isFinished, canSub, round,
  onViewMatch, onTogglePause, onSubClick, onAdvance,
}: MatchDayTableProps) {
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  const allMatches: MatchEntry[] = [
    { homeTeamId: playerHomeTeamId, awayTeamId: playerAwayTeamId, events: playerEvents, isPlayerMatch: true },
    ...otherResults.map(r => ({ homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId, events: r.events, isPlayerMatch: false })),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Série A — Rodada {round}</span>
        <div className={styles.headerRight}>
          {!isFinished && (
            <>
              <button className={styles.controlBtn} onClick={onTogglePause} title={isPaused ? 'Continuar' : 'Pausar'}>
                {isPaused ? '▶' : '⏸'}
              </button>
              {canSub && (
                <button className={styles.subBtn} onClick={onSubClick}>
                  ↕ Sub
                </button>
              )}
            </>
          )}
          <span className={styles.clock}>{isFinished ? 'FT' : `${displayedMinute}'`}</span>
        </div>
      </div>

      <div className={styles.matchList}>
        {allMatches.map(match => {
          const hScore = match.events.filter(e => e.type === 'goal' && e.team === 'home' && e.minute <= displayedMinute).length;
          const aScore = match.events.filter(e => e.type === 'goal' && e.team === 'away' && e.minute <= displayedMinute).length;
          const recent = getRecentEvent(match.events, displayedMinute);
          const ht = teamMap.get(match.homeTeamId);
          const at = teamMap.get(match.awayTeamId);

          return (
            <div
              key={`${match.homeTeamId}-${match.awayTeamId}`}
              className={`${styles.matchRow} ${match.isPlayerMatch ? styles.playerMatchRow : ''}`}
            >
              <button
                className={styles.teamBox}
                style={{ backgroundColor: ht?.primaryColor ?? '#444' }}
                onClick={() => onViewMatch(match.homeTeamId, match.awayTeamId)}
              >
                {ht?.name ?? match.homeTeamId}
              </button>

              <div className={styles.scoreCell}>
                {hScore} x {aScore}
              </div>

              <button
                className={styles.teamBox}
                style={{ backgroundColor: at?.primaryColor ?? '#444' }}
                onClick={() => onViewMatch(match.homeTeamId, match.awayTeamId)}
              >
                {at?.name ?? match.awayTeamId}
              </button>

              <div className={styles.eventCell}>
                {recent && (
                  <>
                    {recent.type === 'goal' && '⚽'}
                    {recent.type === 'yellow_card' && <span className={styles.miniYellow} />}
                    {recent.type === 'red_card' && <span className={styles.miniRed} />}
                    {' '}{recent.playerName} {recent.minute}&apos;
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isFinished && (
        <div className={styles.footer}>
          <button className={styles.advanceBtn} onClick={onAdvance}>
            Avançar »
          </button>
        </div>
      )}
    </div>
  );
}
