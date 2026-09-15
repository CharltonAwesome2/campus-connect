import Header from './Header';
import styles from './DashboardShell.module.css';

export default function DashboardShell({ role, userName, children }) {
  return (
    <div className={styles.page}>
      <Header role={role} userName={userName} />
      <div className={styles.inner}>{children}</div>
    </div>
  );
}