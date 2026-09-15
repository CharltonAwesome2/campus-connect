import styles from './Progress.module.css';

export default function Progress({ value = 0, className = '' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={[styles.progress, className].filter(Boolean).join(' ')}>
      <div className={styles.indicator} style={{ width: `${pct}%` }} />
    </div>
  );
}