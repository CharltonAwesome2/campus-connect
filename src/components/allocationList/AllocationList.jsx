import Card from '@components/card/Card';
import Badge from '@components/badge/Badge';
import styles from './AllocationList.module.css';

export default function AllocationList({ title, applications, badgeClass, avatarClass, label }) {
  return (
    <Card>
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.body}>
        <div className={styles.list}>
          {applications.map((application) => (
            <div key={application.id} className={styles.row}>
              <div className={styles.left}>
                <div className={`${styles.avatar} ${avatarClass}`}>
                  {application.studentName.charAt(0)}
                </div>
                <div>
                  <p className={styles.name}>{application.studentName}</p>
                  <p className={styles.meta}>{application.residenceName}</p>
                </div>
              </div>
              <div className={styles.right}>
                <Badge className={badgeClass}>{label}</Badge>
                <p className={styles.date}>
                  {new Date(application.appliedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
