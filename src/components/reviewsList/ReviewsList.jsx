// src/components/reviewsList/ReviewsList.jsx
import { Star } from "lucide-react";
import styles from "./ReviewsList.module.css";

export function StarRating({ value = 0, size = 14 }) {
  return (
    <span className={styles.stars} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= value ? styles.starFilled : styles.starEmpty}
          fill={n <= value ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export default function ReviewsList({ reviews, compact = false }) {
  if (!reviews || reviews.length === 0) {
    return compact ? null : <p className={styles.empty}>No reviews yet.</p>;
  }

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className={compact ? styles.compact : styles.wrap}>
      <div className={styles.summary}>
        <StarRating value={Math.round(avg)} />
        <span className={styles.summaryText}>
          {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </span>
      </div>

      {!compact && (
        <div className={styles.list}>
          {reviews.map((r) => (
            <div key={r.id} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.author}>{r.studentName}</span>
                <StarRating value={r.rating} size={12} />
              </div>
              {r.comment && <p className={styles.comment}>{r.comment}</p>}
              <span className={styles.date}>
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}