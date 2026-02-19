import { useState } from 'react';
import styles from './StartScreen.module.css';
import { t } from '../../locales/i18n';
import type { Team } from '../../types';

interface StartScreenProps {
  teams: Team[];
  onConfirm: (teamId: string) => void;
}

export default function StartScreen({ teams, onConfirm }: StartScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h1 className={styles.title}>{t('start.title')}</h1>
        <p className={styles.subtitle}>{t('start.subtitle')}</p>

        <div className={styles.grid}>
          {teams.map(team => (
            <button
              key={team.id}
              className={`${styles.teamBtn} ${selectedId === team.id ? styles.selected : ''}`}
              style={{ borderLeftColor: team.primaryColor }}
              onClick={() => setSelectedId(team.id)}
            >
              <span
                className={styles.colorDot}
                style={{ background: team.primaryColor }}
              />
              {team.name}
            </button>
          ))}
        </div>

        <button
          className={`retro-btn ${styles.confirmBtn}`}
          disabled={selectedId === null}
          onClick={() => selectedId && onConfirm(selectedId)}
        >
          {t('start.confirm')}
        </button>
      </div>
    </div>
  );
}
