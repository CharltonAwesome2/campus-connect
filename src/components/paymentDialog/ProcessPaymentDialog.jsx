// src/components/paymentDialog/ProcessPaymentDialog.jsx
import { useState } from "react";
import { Building2, Copy, CheckCircle, Loader2 } from "lucide-react";
import Dialog from "@components/dialog/Dialog";
import Button from "@components/button/Button";
import styles from "./ProcessPaymentDialog.module.css";

// Fake landlord bank details for the EFT simulation. In a real integration
// these would come from the landlord's profile or a payment-gateway session.
function fakeBankDetails(payment) {
  return {
    bank: "Standard Bank",
    accountName: payment?.landlordCompany || "Landlord",
    accountNumber: "10 12 345 678 9",
    branchCode: "051001",
    reference: payment?.reference || "-",
    amount: payment?.amount ?? 0,
  };
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldValue}>{value}</span>
        <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label={`Copy ${label}`}>
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function ProcessPaymentDialog({ open, payment, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!payment) return null;

  const bank = fakeBankDetails(payment);

  const handleConfirm = async () => {
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(payment.id);
      // Parent closes the dialog on success.
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => {} : onClose}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div className={styles.iconWrap}>
            <Building2 size={20} />
          </div>
          <div>
            <h2 className={styles.title}>Pay via EFT</h2>
            <p className={styles.subtitle}>
              Transfer to the account below, then confirm.
            </p>
          </div>
        </div>

        <div className={styles.amountBlock}>
          <span className={styles.amountLabel}>Amount due</span>
          <span className={styles.amountValue}>R{bank.amount.toLocaleString()}</span>
        </div>

        <div className={styles.details}>
          <CopyField label="Bank" value={bank.bank} />
          <CopyField label="Account name" value={bank.accountName} />
          <CopyField label="Account number" value={bank.accountNumber} />
          <CopyField label="Branch code" value={bank.branchCode} />
          <CopyField label="Reference" value={bank.reference} />
        </div>

        <p className={styles.hint}>
          Use the reference exactly as shown - it's how the payment is matched to your account.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Processing...
              </>
            ) : (
              "I've made the transfer"
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}