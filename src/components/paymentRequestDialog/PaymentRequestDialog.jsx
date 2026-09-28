// src/components/paymentRequestDialog/PaymentRequestDialog.jsx
import { useState } from "react";
import { Receipt } from "lucide-react";
import Dialog from "@components/dialog/Dialog";
import Button from "@components/button/Button";
import Input from "@components/input/Input";
import Label from "@components/label/Label";
import styles from "./PaymentRequestDialog.module.css";

export default function PaymentRequestDialog({ open, application, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Monthly rent");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!dueDate) {
      setError("Please pick a due date.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        applicationId: application.id,
        amount: parsedAmount,
        description: description.trim() || "Monthly rent",
        dueDate,
      });
      // Parent closes the dialog on success.
      setAmount("");
      setDescription("Monthly rent");
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().slice(0, 10));
    } catch (err) {
      setError(err.message || "Could not create payment request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => {} : onClose}>
      <form className={styles.wrap} onSubmit={handleSubmit}>
        <div className={styles.head}>
          <div className={styles.iconWrap}>
            <Receipt size={20} />
          </div>
          <div>
            <h2 className={styles.title}>Request Payment</h2>
            <p className={styles.subtitle}>
              {application.studentName} · {application.residenceName}
            </p>
          </div>
        </div>

        <div className={styles.field}>
          <Label htmlFor="pr-amount">Amount (R)</Label>
          <Input
            id="pr-amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="4200"
            disabled={submitting}
          />
        </div>

        <div className={styles.field}>
          <Label htmlFor="pr-desc">Description</Label>
          <Input
            id="pr-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Monthly rent"
            disabled={submitting}
          />
        </div>

        <div className={styles.field}>
          <Label htmlFor="pr-due">Due date</Label>
          <Input
            id="pr-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={submitting}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Creating..." : "Create request"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}