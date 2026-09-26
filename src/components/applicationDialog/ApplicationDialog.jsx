import { useState, useEffect } from "react";
import Dialog from "@components/dialog/Dialog";
import Input from "@components/input/Input";
import Label from "@components/label/Label";
import Button from "@components/button/Button";
import styles from "./ApplicationDialog.module.css";

const emptyForm = {
  notes: "",
  moveInDate: "",
};

export default function ApplicationDialog({ open, residence, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  // Reset when reopened / when the target residence changes
  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open, residence?.id]);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!residence) return;
    onSubmit({
      residenceId: residence.id,
      status: "pending",
      appliedDate: new Date().toISOString().slice(0, 10),
      notes: form.notes.trim() || null,
      moveInDate: form.moveInDate || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className={styles.title}>Apply for {residence?.name}</h2>

      <div className={styles.body}>
        <p className={styles.subtitle}>
          {residence?.address} · {residence?.distanceKm} km from campus
        </p>

        <div>
          <Label htmlFor="move-in-date">Preferred move-in date (optional)</Label>
          <Input
            id="move-in-date"
            type="date"
            value={form.moveInDate}
            onChange={updateField("moveInDate")}
          />
        </div>

        <div>
          <Label htmlFor="notes">Why do you want this residence? (optional)</Label>
          <textarea
            id="notes"
            className={styles.textarea}
            value={form.notes}
            onChange={updateField("notes")}
            placeholder="Tell the landlord a bit about yourself and your needs…"
            rows={5}
          />
        </div>

        <div className={styles.actions}>
          <Button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </Button>
          <Button className={styles.submitBtn} onClick={handleSubmit}>
            Submit Application
          </Button>
        </div>
      </div>
    </Dialog>
  );
}