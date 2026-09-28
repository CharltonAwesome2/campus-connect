// src/components/maintenanceCard/MaintenanceCard.jsx
import { Wrench, Clock, CheckCircle, XCircle, Calendar, FileText, AlertCircle } from "lucide-react";
import Button from "@components/button/Button";
import Card from "@components/card/Card";
import Badge from "@components/badge/Badge";
import Select from "@components/select/Select";
import { maintenanceStatusOptions, maintenancePriorityOptions } from "@data/options";
import styles from "./MaintenanceCard.module.css";

function StatusBadge({ status }) {
  if (status === "open") {
    return (
      <Badge className={styles.badgeOpen}>
        <AlertCircle size={14} /> Open
      </Badge>
    );
  }
  if (status === "in_progress") {
    return (
      <Badge className={styles.badgeInProgress}>
        <Clock size={14} /> In Progress
      </Badge>
    );
  }
  if (status === "resolved") {
    return (
      <Badge className={styles.badgeResolved}>
        <CheckCircle size={14} /> Resolved
      </Badge>
    );
  }
  return (
    <Badge className={styles.badgeClosed}>
      <XCircle size={14} /> Closed
    </Badge>
  );
}

function PriorityBadge({ priority }) {
  const label =
    priority === 1 ? "Critical" :
    priority === 2 ? "High" :
    priority === 3 ? "Normal" :
    priority === 4 ? "Low" :
    "Minor";

  const cls =
    priority <= 2 ? styles.priorityHigh :
    priority === 3 ? styles.priorityNormal :
    styles.priorityLow;

  return <Badge className={cls}>P{priority} · {label}</Badge>;
}

export default function MaintenanceCard({
  request,
  showControls = false,
  showStudent = false,
  onStatusChange,
  onPriorityChange,
  onCancel,
}) {
  const canCancel = !showControls && request.status === "open" && onCancel;

  return (
    <Card className={styles.card}>
      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <h3 className={styles.title}>{request.title}</h3>
            <p className={styles.residence}>
              <Wrench size={13} /> {request.residenceName}
              {showStudent && request.studentName && ` · ${request.studentName}`}
            </p>
          </div>
          <div className={styles.badges}>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>
        </div>

        {request.description && (
          <div className={styles.description}>
            <div className={styles.descriptionHead}>
              <FileText size={14} />
              <span>Details</span>
            </div>
            <p className={styles.descriptionBody}>{request.description}</p>
          </div>
        )}

        <div className={styles.details}>
          <div className={styles.detail}>
            <Calendar size={14} />
            <span>Filed {new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
          {request.resolvedAt && (
            <div className={styles.detail}>
              <CheckCircle size={14} />
              <span>Resolved {new Date(request.resolvedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {showControls && (
          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Status</label>
              <Select
                value={request.status}
                onChange={(e) => onStatusChange?.(request.id, e.target.value)}
                options={maintenanceStatusOptions}
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Priority</label>
              <Select
                value={String(request.priority)}
                onChange={(e) => onPriorityChange?.(request.id, e.target.value)}
                options={maintenancePriorityOptions}
              />
            </div>
          </div>
        )}

        {canCancel && (
          <div className={styles.actions}>
            <Button className={styles.cancelBtn} onClick={() => onCancel(request.id)}>
              <XCircle size={16} /> Cancel request
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}