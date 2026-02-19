import styles from './MatchResult.module.css';
import type { MatchResult as MatchResultType, Team, Player } from '../../types';

interface MatchResultProps {
  result: MatchResultType;
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  onBack: () => void;
}

export default function MatchResult({
  result,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  onBack,
}: MatchResultProps) {
  const homePlayerMap = new Map(homePlayers.map(p => [p.id, p]));
  const awayPlayerMap = new Map(awayPlayers.map(p => [p.id, p]));

  const homeStarters = result.homeLineup.startingXI
    .map(id => homePlayerMap.get(id))
    .filter(Boolean) as Player[];
  const homeSubs = result.homeLineup.subs
    .map(id => homePlayerMap.get(id))
    .filter(Boolean) as Player[];
  const awayStarters = result.awayLineup.startingXI
    .map(id => awayPlayerMap.get(id))
    .filter(Boolean) as Player[];
  const awaySubs = result.awayLineup.subs
    .map(id => awayPlayerMap.get(id))
    .filter(Boolean) as Player[];

  return (
    <div className={styles.container}>
      <div className={styles.panels}>
        {/* Home lineup */}
        <div className={styles.lineupPanel}>
          <div className={styles.lineupHeader}>
            <span className={styles.teamColor} style={{ backgroundColor: homeTeam.primaryColor }} />
            {homeTeam.name}
          </div>
          <div className={styles.sectionTitle}>Titulares</div>
          {homeStarters.map(p => (
            <div key={p.id} className={styles.playerRow}>
              <span className={styles.playerPos}>{p.position}</span>
              <span>{p.name}</span>
            </div>
          ))}
          {homeSubs.length > 0 && (
            <>
              <div className={styles.sectionTitle}>Reservas</div>
              {homeSubs.map(p => (
                <div key={p.id} className={styles.playerRow}>
                  <span className={styles.playerPos}>{p.position}</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </>
          )}
          <button className={styles.actionButton} onClick={onBack}>
            Voltar ao jogo
          </button>
        </div>

        {/* Events center */}
        <div className={styles.eventsPanel}>
          <div className={styles.scoreHeader}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>
              {result.stadium}
            </div>
            <div className={styles.scoreTeams}>
              <span>{homeTeam.shortName}</span>
              <span className={styles.scoreNumber}>{result.homeScore}</span>
              <span className={styles.scoreX}>X</span>
              <span className={styles.scoreNumber}>{result.awayScore}</span>
              <span>{awayTeam.shortName}</span>
            </div>
          </div>

          <div className={styles.eventsList}>
            {result.events.map((event, i) => (
              <div
                key={i}
                className={`${styles.event} ${event.type === 'goal' ? styles.eventGoal : ''}`}
              >
                <span className={styles.eventMinute}>{event.minute}&apos;</span>
                <span className={styles.eventIcon}>
                  {event.type === 'goal' && '⚽'}
                  {event.type === 'yellow_card' && <span className={styles.yellowCard} />}
                </span>
                <span>
                  {event.type === 'goal' && `${event.score} - `}
                  {event.playerName}
                  {event.type === 'goal' && ` - ${event.half}°`}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.attendance}>
            Público: {result.attendance.toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Away lineup */}
        <div className={styles.lineupPanel}>
          <div className={styles.lineupHeader}>
            <span className={styles.teamColor} style={{ backgroundColor: awayTeam.primaryColor }} />
            {awayTeam.name}
          </div>
          <div className={styles.sectionTitle}>Titulares</div>
          {awayStarters.map(p => (
            <div key={p.id} className={styles.playerRow}>
              <span className={styles.playerPos}>{p.position}</span>
              <span>{p.name}</span>
            </div>
          ))}
          {awaySubs.length > 0 && (
            <>
              <div className={styles.sectionTitle}>Reservas</div>
              {awaySubs.map(p => (
                <div key={p.id} className={styles.playerRow}>
                  <span className={styles.playerPos}>{p.position}</span>
                  <span>{p.name}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
