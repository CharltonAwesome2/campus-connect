import { Calendar, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../button/Button';
import Card from '../card/Card';
import Badge from '../badge/Badge';
import styles from './ApplicationCard.module.css';

function StatusBadge({ status }) {
  if (status === 'approved') {
    return (
      <Badge className={styles.badgeApproved}>
        <CheckCircle size={14} />
        Approved
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge className={styles.badgeRejected}>
        <XCircle size={14} />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className={styles.badgePending}>
      <Clock size={14} />
      Pending
    </Badge>
  );
}

export default function ApplicationCard({ application, showActions = false, onApprove, onReject }) {
  return (
    <Card className={styles.card}>
      <div className={styles.body}>
        <div className={styles.head}>
          <div>
            <h3 className={styles.name}>{application.residenceName}</h3>
            {showActions && (
              <p className={styles.student}>{application.studentName}</p>
            )}
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className={styles.details}>
          {showActions && (
            <>
              <div className={styles.detail}>
                <Mail size={14} />
                <span>{application.email}</span>
              </div>
              <div className={styles.detail}>
                <Phone size={14} />
                <span>{application.phone}</span>
              </div>
            </>
          )}
          <div className={styles.detail}>
            <Calendar size={14} />
            <span>Applied on {new Date(application.appliedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {showActions && application.status === 'pending' && (
          <div className={styles.actions}>
            <Button className={styles.approveBtn} onClick={() => onApprove?.(application.id)}>
              <CheckCircle size={16} />
              Approve
            </Button>
            <Button className={styles.rejectBtn} onClick={() => onReject?.(application.id)}>
              <XCircle size={16} />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}