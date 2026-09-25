import Card from '@components/card/Card';
import Progress from '../progress/Progress';
import styles from './StatCard.module.css';

export default function StatCard({ label, value, Icon, color, bg, progress }) {
  return (
    <Card className={styles.card}>
      <div className={styles.body}>
        <div>
          <p className={styles.label}>{label}</p>
          <p className={styles.value} style={{ color }}>{value}</p>
        </div>
        <div className={styles.icon} style={{ background: bg }}>
          <Icon size={24} color={color} />
        </div>
      </div>
      {progress !== undefined && (
        <div className={styles.progressWrap}>
          <Progress value={progress} />
        </div>
      )}
    </Card>
  );
}