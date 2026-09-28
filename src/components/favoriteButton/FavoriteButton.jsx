// src/components/favoriteButton/FavoriteButton.jsx
import { Heart } from "lucide-react";
import styles from "./FavoriteButton.module.css";

export default function FavoriteButton({ isFavorite, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle?.();
      }}
      disabled={disabled}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
      className={[
        styles.btn,
        isFavorite ? styles.active : "",
        disabled ? styles.disabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}