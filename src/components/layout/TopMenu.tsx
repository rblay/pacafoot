import styles from './TopMenu.module.css';

interface TopMenuProps {
  onNavigate: (view: 'league' | 'team') => void;
}

export default function TopMenu({ onNavigate }: TopMenuProps) {
  return (
    <div className={styles.menuBar}>
      <button className={styles.menuItem} onClick={() => onNavigate('league')}>
        Classificação
      </button>
      <button className={styles.menuItem} onClick={() => onNavigate('team')}>
        Equipe
      </button>
    </div>
  );
}
