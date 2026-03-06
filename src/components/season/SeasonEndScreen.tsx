import styles from './SeasonEndScreen.module.css';
import type { LeagueTableEntry, Team } from '../../types';
import { t } from '../../locales/i18n';

interface SeasonEndScreenProps {
  leagueTable: LeagueTableEntry[];
  teams: Team[];
  onNewGame: () => void;
}

function getZoneClass(position: number): string {
  if (position === 1) return styles.champion;
  if (position <= 4) return styles.libertadores;
  if (position >= 17) return styles.relegated;
  return position % 2 === 0 ? styles.rowEven : styles.rowOdd;
}

export default function SeasonEndScreen({ leagueTable, teams, onNewGame }: SeasonEndScreenProps) {
  const teamMap = new Map(teams.map(t => [t.id, t]));
  const champion = teamMap.get(leagueTable[0]?.teamId);

  return (
    <div className={styles.container}>
      {champion && (
        <div
          className={styles.championBanner}
          style={{ background: champion.primaryColor, color: champion.secondaryColor }}
        >
          <span className={styles.trophy}>★</span>
          <span>{t('season.champion')}: {champion.name}</span>
          <span className={styles.trophy}>★</span>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <div className={styles.header}>{t('season.finalStandings')}</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('league.col.team')}</th>
              <th>{t('league.col.pts')}</th>
              <th>{t('league.col.played')}</th>
              <th>{t('league.col.won')}</th>
              <th>{t('league.col.drawn')}</th>
              <th>{t('league.col.lost')}</th>
              <th>{t('league.col.gf')}</th>
              <th>{t('league.col.ga')}</th>
              <th>{t('league.col.gd')}</th>
            </tr>
          </thead>
          <tbody>
            {leagueTable.map((entry) => {
              const team = teamMap.get(entry.teamId);
              const goalDiff = entry.goalsFor - entry.goalsAgainst;
              return (
                <tr key={entry.teamId} className={getZoneClass(entry.position)}>
                  <td className={styles.positionCell}>{entry.position}</td>
                  <td className={styles.teamName}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: team?.primaryColor ?? '#888' }}
                    />
                    {team?.name ?? entry.teamId}
                  </td>
                  <td><strong>{entry.points}</strong></td>
                  <td>{entry.played}</td>
                  <td>{entry.won}</td>
                  <td>{entry.drawn}</td>
                  <td>{entry.lost}</td>
                  <td>{entry.goalsFor}</td>
                  <td>{entry.goalsAgainst}</td>
                  <td>{goalDiff > 0 ? `+${goalDiff}` : goalDiff}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendChampion}`} />
          {t('season.legend.champion')}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendLibertadores}`} />
          {t('season.legend.libertadores')}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendRelegated}`} />
          {t('season.legend.relegated')}
        </span>
      </div>

      <div className={styles.footer}>
        <button className={styles.actionButton} onClick={onNewGame}>
          {t('save.newGame')}
        </button>
      </div>
    </div>
  );
}
