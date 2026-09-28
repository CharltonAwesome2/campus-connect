// src/components/reviewDialog/ReviewDialog.jsx
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Dialog from "@components/dialog/Dialog";
import Button from "@components/button/Button";
import Label from "@components/label/Label";
import styles from "./ReviewDialog.module.css";

export default function ReviewDialog({ open, residence, existingReview, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset form whenever the dialog opens or the target changes.
  useEffect(() => {
    if (!open) return;
    setRating(existingReview?.rating ?? 0);
    setComment(existingReview?.comment ?? "");
    setHover(0);
    setError(null);
    setSubmitting(false);
  }, [open, existingReview?.id, existingReview?.rating, existingReview?.comment]);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError("Please pick a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ residenceId: residence.id, rating, comment: comment.trim() || null });
    } catch (err) {
      setError(err.message || "Could not save your review.");
      setSubmitting(false);
    }
  };

  const isEdit = !!existingReview;

  return (
    <Dialog open={open} onClose={submitting ? () => {} : onClose}>
      <div className={styles.wrap}>
        <h2 className={styles.title}>{isEdit ? "Edit your review" : "Leave a review"}</h2>
        <p className={styles.subtitle}>{residence?.name}</p>

        <div className={styles.field}>
          <Label>Rating</Label>
          <div className={styles.starPicker} onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= (hover || rating);
              return (
                <button
                  key={n}
                  type="button"
                  className={styles.starBtn}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                >
                  <Star size={28} fill={filled ? "currentColor" : "none"} />
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.field}>
          <Label htmlFor="review-comment">Comment (optional)</Label>
          <textarea
            id="review-comment"
            className={styles.textarea}
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What was your experience living here?"
            disabled={submitting}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Post review"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}