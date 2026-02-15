import styles from './TopMenu.module.css';
import { t } from '../../locales/i18n';
import type { Language } from '../../locales/i18n';

interface TopMenuProps {
  onNavigate: (view: 'league' | 'team') => void;
  onSave: () => void;
  onLanguageChange: (lang: Language) => void;
  currentLanguage: Language;
}

export default function TopMenu({ onNavigate, onSave, onLanguageChange, currentLanguage }: TopMenuProps) {
  return (
    <div className={styles.menuBar}>
      <button className={styles.menuItem} onClick={() => onNavigate('league')}>
        {t('menu.standings')}
      </button>
      <button className={styles.menuItem} onClick={() => onNavigate('team')}>
        {t('menu.team')}
      </button>
      <button className={styles.menuItem} onClick={onSave}>
        {t('menu.save')}
      </button>
      <div style={{ marginLeft: 'auto' }}>
        <button
          className={styles.menuItem}
          onClick={() => onLanguageChange(currentLanguage === 'pt' ? 'en' : 'pt')}
        >
          {currentLanguage === 'pt' ? 'EN' : 'PT'}
        </button>
      </div>
    </div>
  );
}
