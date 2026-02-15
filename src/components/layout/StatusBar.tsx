import styles from './StatusBar.module.css';

interface StatusBarProps {
  teamName: string;
  round: number;
}

export default function StatusBar({ teamName, round }: StatusBarProps) {
  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        <span>{teamName}</span>
        <span>Rodada: {round}</span>
      </div>
      <div className={styles.right}>
        <span>Pacafoot v0.1</span>
      </div>
    </div>
  );
}
