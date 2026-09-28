// src/components/paymentRow/PaymentRow.jsx
import { Link } from "react-router";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import Button from "@components/button/Button";
import Card from "@components/card/Card";
import Badge from "@components/badge/Badge";
import styles from "./PaymentRow.module.css";

function StatusBadge({ status }) {
  if (status === "paid") {
    return (
      <Badge className={styles.badgePaid}>
        <CheckCircle size={14} />
        Paid
      </Badge>
    );
  }
  if (status === "overdue") {
    return (
      <Badge className={styles.badgeOverdue}>
        <AlertCircle size={14} />
        Overdue
      </Badge>
    );
  }
  if (status === "cancelled") {
    return (
      <Badge className={styles.badgeCancelled}>
        <XCircle size={14} />
        Cancelled
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

export default function PaymentRow({ payment, showStudent = false, onPay }) {
  const dueLabel =
    payment.status === "paid" && payment.paidAt
      ? `Paid on ${new Date(payment.paidAt).toLocaleDateString()}`
      : `Due ${new Date(payment.dueDate).toLocaleDateString()}`;

  const canPay = payment.status === "pending" || payment.status === "overdue";

  return (
    <Card className={styles.card}>
      <div className={styles.body}>
        <div className={styles.head}>
          <div>
            <h3 className={styles.name}>{payment.residenceName}</h3>
            {showStudent && payment.studentName && (
              <p className={styles.student}>{payment.studentName}</p>
            )}
          </div>
          <StatusBadge status={payment.status} />
        </div>

        <div className={styles.details}>
          <div className={styles.detail}>
            <Calendar size={14} />
            <span>{dueLabel}</span>
          </div>
          {payment.reference && (
            <div className={styles.detail}>
              <FileText size={14} />
              <span>Ref: {payment.reference}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.amount}>R{payment.amount.toLocaleString()}</div>
          <div className={styles.actions}>
            <Link to={`/payments/${payment.id}`} className={styles.viewLink}>
              <ExternalLink size={14} />
              View
            </Link>
            {onPay && canPay && (
              <Button className={styles.payBtn} onClick={() => onPay(payment)}>
                <CreditCard size={16} />
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}