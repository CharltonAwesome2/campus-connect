// src/components/maintenanceRequestDialog/MaintenanceRequestDialog.jsx
import { useEffect, useState } from "react";
import Dialog from "@components/dialog/Dialog";
import Button from "@components/button/Button";
import Input from "@components/input/Input";
import Label from "@components/label/Label";
import Select from "@components/select/Select";
import styles from "./MaintenanceRequestDialog.module.css";

export default function MaintenanceRequestDialog({
  open,
  approvedResidences = [],   // [{ id, name }]
  onClose,
  onSubmit,
}) {
  const [residenceId, setResidenceId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setResidenceId(approvedResidences[0]?.id ?? "");
    setTitle("");
    setDescription("");
    setSubmitting(false);
    setError(null);
  }, [open, approvedResidences]);

  const handleSubmit = async () => {
    if (!residenceId) {
      setError("Pick a residence.");
      return;
    }
    if (!title.trim()) {
      setError("Give your request a short title.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        residenceId,
        title: title.trim(),
        description: description.trim() || null,
        priority: 3,   // default; landlord triages
      });
    } catch (err) {
      setError(err.message || "Could not submit your request.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? () => {} : onClose}>
      <div className={styles.wrap}>
        <h2 className={styles.title}>New maintenance request</h2>
        <p className={styles.subtitle}>
          Tell your landlord what needs fixing. They'll triage and update the status.
        </p>

        <div className={styles.field}>
          <Label htmlFor="mr-residence">Residence</Label>
          <Select
            id="mr-residence"
            value={residenceId}
            onChange={(e) => setResidenceId(e.target.value)}
            options={approvedResidences.map((r) => ({ value: r.id, label: r.name }))}
          />
        </div>

        <div className={styles.field}>
          <Label htmlFor="mr-title">Title</Label>
          <Input
            id="mr-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Kitchen tap leaking"
            required
          />
        </div>

        <div className={styles.field}>
          <Label htmlFor="mr-description">Description (optional)</Label>
          <textarea
            id="mr-description"
            className={styles.textarea}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any details that will help your landlord fix this quickly."
            disabled={submitting}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}