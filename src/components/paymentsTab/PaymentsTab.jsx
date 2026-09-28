// src/components/paymentsTab/PaymentsTab.jsx
import { useState } from "react";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import PaymentRow from "@components/paymentRow/PaymentRow";
import ProcessPaymentDialog from "@components/paymentDialog/ProcessPaymentDialog";
import StatCard from "@components/statCard/StatCard";
import EmptyState from "@components/emptyState/EmptyState";
import Card from "@components/card/Card";
import Tabs from "@components/tabs/Tabs";
import { toast } from "sonner";
import { motion } from "motion/react";
import styles from "./PaymentsTab.module.css";

export default function PaymentsTab({
  payments,
  processPayment,
  showStudent = false,
  title = "Payments",
}) {
  const [dialogPayment, setDialogPayment] = useState(null);

  const outstanding = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
  const completed = payments.filter(
    (p) => p.status === "paid" || p.status === "cancelled"
  );

  const outstandingTotal = outstanding.reduce((s, p) => s + p.amount, 0);

  const statCards = [
    {
      label: "Outstanding",
      value: `R${outstandingTotal.toLocaleString()}`,
      Icon: CreditCard,
      color: "#2563eb",
      bg: "#dbeafe",
    },
    {
      label: "Paid",
      value: payments.filter((p) => p.status === "paid").length,
      Icon: CheckCircle,
      color: "#16a34a",
      bg: "#dcfce7",
    },
    {
      label: "Pending",
      value: payments.filter((p) => p.status === "pending").length,
      Icon: Clock,
      color: "#ca8a04",
      bg: "#fef9c3",
    },
    {
      label: "Overdue",
      value: payments.filter((p) => p.status === "overdue").length,
      Icon: AlertCircle,
      color: "#dc2626",
      bg: "#fee2e2",
    },
  ];

  const subTabs = [
    { value: "current", label: "Current" },
    { value: "history", label: "History" },
    { value: "invoices", label: "Invoices" },
  ];

  const handleConfirm = async (paymentId) => {
    try {
      await processPayment(paymentId);
      toast.success("Payment successful");
      setDialogPayment(null);
    } catch (err) {
      // The dialog surfaces the error; rethrow so it can.
      throw err;
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        {statCards.map(({ label, value, Icon, color, bg }) => (
          <StatCard key={label} label={label} value={value} Icon={Icon} color={color} bg={bg} />
        ))}
      </div>

      <Tabs tabs={subTabs} defaultValue="current">
        {(sub) => {
          const list =
            sub === "current"
              ? outstanding
              : sub === "history"
                ? completed
                : outstanding; // invoices = same set as current, presented as documents

          const emptyTitle =
            sub === "current"
              ? "Nothing outstanding"
              : sub === "history"
                ? "No past payments"
                : "No invoices";

          const listTitle =
            sub === "current"
              ? "Outstanding Payments"
              : sub === "history"
                ? "Payment History"
                : "Invoices";

          return (
            <Card>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>
                  {sub === "current" ? title : listTitle}
                </h3>
              </div>
              <div className={styles.cardBody}>
                {list.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <PaymentRow
                      payment={payment}
                      showStudent={showStudent}
                      onPay={processPayment ? (p) => setDialogPayment(p) : undefined}
                    />
                  </motion.div>
                ))}
                {list.length === 0 && (
                  <EmptyState
                    Icon={CreditCard}
                    title={emptyTitle}
                    subtitle="Payments appear here once your application is approved"
                  />
                )}
              </div>
            </Card>
          );
        }}
      </Tabs>

      {processPayment && (
        <ProcessPaymentDialog
          open={!!dialogPayment}
          payment={dialogPayment}
          onClose={() => setDialogPayment(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}