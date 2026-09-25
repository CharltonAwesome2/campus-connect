// src/components/NotificationBell.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { useData } from "@data/DataContext";
import styles from "./NotificationBell.module.css";

// "5 min ago", "2 h ago", "3 d ago"
function formatRelative(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
      } catch (err) {
        console.error("Failed to mark notification read", err);
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bellBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={handleMarkAll}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <p className={styles.empty}>No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`${styles.item} ${!n.isRead ? styles.itemUnread : ""}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className={styles.itemHead}>
                    <p className={styles.itemTitle}>{n.title}</p>
                    {!n.isRead && <span className={styles.dot} />}
                  </div>
                  {n.body && <p className={styles.itemBody}>{n.body}</p>}
                  <p className={styles.itemTime}>{formatRelative(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}