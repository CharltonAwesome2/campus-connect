import styles from './EmptyState.module.css';

export default function EmptyState({ Icon, title, subtitle }) {
  return (
    <div className={styles.wrap}>
      <Icon size={48} color="#9ca3af" />
      <p className={styles.title}>{title}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}