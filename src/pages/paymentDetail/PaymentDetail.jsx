// src/pages/PaymentDetail.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Printer, CreditCard } from "lucide-react";
import DashboardShell from "@components/dashboardShell/DashboardShell";
import Button from "@components/button/Button";
import Card from "@components/card/Card";
import EmptyState from "@components/emptyState/EmptyState";
import ProcessPaymentDialog from "@components/paymentDialog/ProcessPaymentDialog";
import { useData } from "@data/DataContext";
import { useAuth } from "@context/AuthContext";
import { toast } from "sonner";
import styles from "./PaymentDetail.module.css";

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { payments, processPayment } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const payment = payments.find((p) => p.id === id);

  // RLS already filters `payments` to what this user can see, but we do a
  // second ownership check so a stray UUID can't render someone else's doc.
  const isOwner =
    payment && (user.role === "admin" || payment.studentUserId === user.id || payment.landlordId === user.landlordId);

  if (!payment || !isOwner) {
    return (
      <DashboardShell role={user.role} userName={user.name}>
        <Card>
          <EmptyState title="Payment not found" subtitle="This invoice doesn't exist or isn't yours." />
          <div style={{ textAlign: "center", paddingBottom: "1.5rem" }}>
            <Link to="/" className={styles.backLink}>
              <ArrowLeft size={14} /> Back
            </Link>
          </div>
        </Card>
      </DashboardShell>
    );
  }

  const isReceipt = payment.status === "paid";
  const isCancelled = payment.status === "cancelled";
  const canPay = payment.status === "pending" || payment.status === "overdue";

  const documentTitle = isCancelled ? "CANCELLED" : isReceipt ? "RECEIPT" : "INVOICE";

  const issueDate = payment.createdAt ? new Date(payment.createdAt) : new Date(payment.dueDate);

  const handleConfirmPayment = async (paymentId) => {
    try {
      await processPayment(paymentId);
      toast.success("Payment successful", {
        description: "A receipt is now available.",
      });
      setDialogOpen(false);
    } catch (err) {
      // The dialog surfaces the message; rethrow so it can.
      throw err;
    }
  };

  return (
    <DashboardShell role={user.role} userName={user.name}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className={styles.topActions}>
          <Button className={styles.printBtn} onClick={() => window.print()}>
            <Printer size={16} />
            Print / Save as PDF
          </Button>
          {canPay && (user.role === "student" || user.role === "admin") && (
            <Button className={styles.payBtn} onClick={() => setDialogOpen(true)}>
              <CreditCard size={16} />
              Pay Now
            </Button>
          )}
        </div>
      </div>

      <div className={styles.docWrap}>
        <div className={styles.doc}>
          <div className={styles.docHead}>
            <div>
              <h1 className={styles.docBrand}>CampusConnect</h1>
              <p className={styles.docSub}>Student Housing Platform</p>
            </div>
            <div className={styles.docTitleWrap}>
              <h2 className={styles.docTitle}>{documentTitle}</h2>
              <p className={styles.docNumber}>{payment.reference}</p>
            </div>
          </div>

          <div className={styles.metaGrid}>
            <div>
              <div className={styles.metaLabel}>Issued</div>
              <div className={styles.metaValue}>{issueDate.toLocaleDateString()}</div>
            </div>
            <div>
              <div className={styles.metaLabel}>{isReceipt ? "Paid on" : "Due"}</div>
              <div className={styles.metaValue}>
                {isReceipt && payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString()
                  : new Date(payment.dueDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className={styles.metaLabel}>Status</div>
              <div className={styles.metaValue} style={{ textTransform: "capitalize" }}>
                {payment.status}
              </div>
            </div>
          </div>

          <div className={styles.partyGrid}>
            <div>
              <div className={styles.partyLabel}>From</div>
              <div className={styles.partyName}>{payment.landlordCompany || "Landlord"}</div>
              {payment.landlordEmail && <div className={styles.partyLine}>{payment.landlordEmail}</div>}
            </div>
            <div>
              <div className={styles.partyLabel}>To</div>
              <div className={styles.partyName}>{payment.studentName}</div>
              {payment.studentEmail && <div className={styles.partyLine}>{payment.studentEmail}</div>}
            </div>
          </div>

          <table className={styles.lines}>
            <thead>
              <tr>
                <th>Description</th>
                <th className={styles.numCol}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className={styles.lineName}>{payment.residenceName}</div>
                  <div className={styles.lineSub}>
                    {payment.description || "Monthly rent"} - due {new Date(payment.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td className={styles.numCol}>R{payment.amount.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className={styles.totalLabel}>Total</td>
                <td className={`${styles.numCol} ${styles.totalValue}`}>R{payment.amount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {isReceipt && (
            <div className={styles.paymentNote}>
              <div className={styles.noteLabel}>Paid via</div>
              <div className={styles.noteValue}>
                {(payment.paymentMethod || "eft").toUpperCase()}
                {payment.gatewayTransactionId ? ` · Transaction ${payment.gatewayTransactionId}` : ""}
              </div>
            </div>
          )}

          {canPay && (
            <div className={styles.paymentNote}>
              <div className={styles.noteLabel}>Payment instructions</div>
              <div className={styles.noteValue}>Click "Pay Now" to complete payment via EFT.</div>
            </div>
          )}

          <div className={styles.docFooter}>Thank you for using CampusConnect.</div>
        </div>
      </div>

      <ProcessPaymentDialog
        open={dialogOpen}
        payment={payment}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmPayment}
      />
    </DashboardShell>
  );
}
