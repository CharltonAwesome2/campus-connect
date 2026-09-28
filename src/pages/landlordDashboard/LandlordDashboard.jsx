// src/pages/landlordDashboard/LandlordDashboard.jsx
import { useState, useMemo } from "react";
import DashboardShell from "@components/dashboardShell/DashboardShell";
import ResidenceCard from "@components/residenceCard/ResidenceCard";
import ApplicationCard from "@components/applicationCard/ApplicationCard";
import PaymentsTab from "@components/paymentsTab/PaymentsTab";
import PaymentRequestDialog from "@components/paymentRequestDialog/PaymentRequestDialog";
import ReviewsList from "@components/reviewsList/ReviewsList";
import MaintenanceCard from "@components/maintenanceCard/MaintenanceCard";
import StatCard from "@components/statCard/StatCard";
import EmptyState from "@components/emptyState/EmptyState";
import AddPropertyDialog from "@components/addPropertyDialog/AddPropertyDialog";
import Card from "@components/card/Card";
import Tabs from "@components/tabs/Tabs";
import Button from "@components/button/Button";
import { useData } from "@data/DataContext";
import {
  Building2,
  FileText,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  Home,
  CreditCard,
  Star,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import styles from "./LandlordDashboard.module.css";
import { useAuth } from "@context/AuthContext";

export default function LandlordDashboard() {
  const {
    residences,
    applications,
    payments,
    reviews,
    maintenanceRequests,
    addResidence,
    removeResidence,
    updateApplicationStatus,
    updateMaintenanceStatus,
    updateMaintenancePriority,
    createPaymentRequest,
  } = useData();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [paymentRequestTarget, setPaymentRequestTarget] = useState(null);

  const landlordResidences = user?.landlordId
    ? residences.filter((r) => r.landlordId === user.landlordId)
    : [];

  const landlordApplications = user?.landlordId
    ? applications.filter((a) => landlordResidences.some((r) => r.id === a.residenceId))
    : [];

  const landlordPayments = user?.landlordId
    ? payments.filter((p) => p.landlordId === user.landlordId)
    : [];

  const landlordResidenceIds = useMemo(
    () => new Set(landlordResidences.map((r) => r.id)),
    [landlordResidences],
  );

  const landlordReviews = useMemo(
    () => reviews.filter((r) => landlordResidenceIds.has(r.residenceId)),
    [reviews, landlordResidenceIds],
  );

  const landlordMaintenance = useMemo(() => {
    const list = maintenanceRequests.filter((m) => landlordResidenceIds.has(m.residenceId));
    // Sort: open + in_progress first (by priority asc), then resolved/closed (by date desc).
    const active = ["open", "in_progress"];
    return list.sort((a, b) => {
      const aActive = active.includes(a.status);
      const bActive = active.includes(b.status);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      if (aActive && bActive) return a.priority - b.priority;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [maintenanceRequests, landlordResidenceIds]);

  const reviewsByResidence = useMemo(() => {
    const map = new Map();
    landlordReviews.forEach((r) => {
      if (!map.has(r.residenceId)) map.set(r.residenceId, []);
      map.get(r.residenceId).push(r);
    });
    return map;
  }, [landlordReviews]);

  const averageRating = landlordReviews.length
    ? (landlordReviews.reduce((s, r) => s + r.rating, 0) / landlordReviews.length).toFixed(1)
    : "-";

  const openMaintenanceCount = landlordMaintenance.filter(
    (m) => m.status === "open" || m.status === "in_progress",
  ).length;

  const handleApprove = async (applicationId) => {
    const application = applications.find((a) => a.id === applicationId);
    try {
      await updateApplicationStatus(applicationId, "approved");
      toast.success(`Application approved for ${application?.studentName}`, {
        description: "The student has been notified.",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not approve application");
    }
  };

  const handleReject = async (applicationId) => {
    const application = applications.find((a) => a.id === applicationId);
    try {
      await updateApplicationStatus(applicationId, "rejected");
      toast.error(`Application rejected for ${application?.studentName}`, {
        description: "The student has been notified.",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not reject application");
    }
  };

  const handleRequestPayment = (application) => {
    setPaymentRequestTarget(application);
  };

  const handleSubmitPaymentRequest = async ({ applicationId, amount, description, dueDate }) => {
    try {
      await createPaymentRequest({ applicationId, amount, description, dueDate });
      toast.success("Payment request created", {
        description: `${paymentRequestTarget?.studentName} has been billed.`,
      });
      setPaymentRequestTarget(null);
    } catch (err) {
      throw err;
    }
  };

  const handleMaintenanceStatusChange = async (id, status) => {
    try {
      await updateMaintenanceStatus(id, status);
      toast.success(`Status updated to ${status.replace("_", " ")}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not update status");
    }
  };

  const handleMaintenancePriorityChange = async (id, priority) => {
    try {
      await updateMaintenancePriority(id, priority);
      toast.success("Priority updated");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not update priority");
    }
  };

  const handleEdit = (residenceId) => {
    const residence = residences.find((r) => r.id === residenceId);
    toast.info(`Editing ${residence?.name}`);
  };

  const handleDelete = (residenceId) => {
    const residence = residences.find((r) => r.id === residenceId);
    removeResidence(residenceId);
    toast.success(`${residence?.name} removed from listings`);
  };

  const handleAddProperty = (data) => {
    if (!data) {
      toast.error("Please fill in name, price, and total rooms.");
      return;
    }
    addResidence({
      landlordId: user.landlordId,
      name: data.name,
      address: data.address || "-",
      description: data.description || "",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
      distanceKm: data.distance ?? 0,
      price: data.price,
      type: data.type,
      totalRooms: data.totalRooms,
      availableRooms: data.totalRooms,
      amenities: [],
    });
    toast.success("New property added successfully!");
    setIsAddDialogOpen(false);
  };

  const totalRooms = landlordResidences.reduce((sum, r) => sum + r.totalRooms, 0);
  const occupiedRooms = landlordResidences.reduce(
    (sum, r) => sum + (r.totalRooms - r.availableRooms),
    0,
  );
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
  const avgPrice =
    landlordResidences.length > 0
      ? (
          landlordResidences.reduce((sum, r) => sum + r.price, 0) / landlordResidences.length
        ).toFixed(0)
      : 0;
  const pendingCount = landlordApplications.filter((a) => a.status === "pending").length;

  const statCards = [
    { label: "Total Properties", value: landlordResidences.length, Icon: Home, color: "#2563eb", bg: "#dbeafe" },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      Icon: TrendingUp,
      color: "#16a34a",
      bg: "#dcfce7",
      progress: parseFloat(occupancyRate),
    },
    { label: "Avg. Price", value: `R${Number(avgPrice).toLocaleString()}`, Icon: DollarSign, color: "#4f46e5", bg: "#e0e7ff" },
    { label: "Pending Apps", value: pendingCount, Icon: FileText, color: "#ca8a04", bg: "#fef9c3" },
  ];

  const tabs = [
    { value: "properties", label: (<><Building2 size={16} /> My Properties</>) },
    { value: "applications", label: (<><FileText size={16} /> Applications ({pendingCount})</>) },
    { value: "payments", label: (<><CreditCard size={16} /> Payments</>) },
    { value: "reviews", label: (<><Star size={16} /> Reviews ({landlordReviews.length})</>) },
    {
      value: "maintenance",
      label: (<><Wrench size={16} /> Maintenance ({openMaintenanceCount})</>),
    },
  ];

  return (
    <DashboardShell role="landlord" userName={user.name}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.statsGrid}
      >
        {statCards.map(({ label, value, Icon, color, bg, progress }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            Icon={Icon}
            color={color}
            bg={bg}
            progress={progress}
          />
        ))}
      </motion.div>

      <Tabs tabs={tabs} defaultValue="properties">
        {(active) => {
          if (active === "properties") {
            return (
              <div className={styles.tabContent}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>Property Listings</h2>
                  <Button className={styles.addBtn} onClick={() => setIsAddDialogOpen(true)}>
                    <Plus size={16} /> Add Property
                  </Button>
                </div>

                <div className={styles.residenceGrid}>
                  {landlordResidences.map((residence, index) => (
                    <motion.div
                      key={residence.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ResidenceCard
                        residence={residence}
                        showActions
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          }

          if (active === "applications") {
            return (
              <Card>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardTitle}>Student Applications</h3>
                </div>
                <div className={styles.cardBody}>
                  {landlordApplications.map((application, index) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ApplicationCard
                        application={application}
                        showActions
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onRequestPayment={handleRequestPayment}
                      />
                    </motion.div>
                  ))}
                  {landlordApplications.length === 0 && (
                    <EmptyState Icon={Users} title="No applications received yet" />
                  )}
                </div>
              </Card>
            );
          }

          if (active === "payments") {
            return <PaymentsTab payments={landlordPayments} showStudent title="Payments Received" />;
          }

          if (active === "reviews") {
            return (
              <Card>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardTitle}>
                    Reviews {landlordReviews.length > 0 && `· Avg ${averageRating}`}
                  </h3>
                </div>
                <div className={styles.cardBody}>
                  {landlordReviews.length === 0 ? (
                    <EmptyState
                      Icon={Star}
                      title="No reviews yet"
                      subtitle="Students can review your residences after their application is approved"
                    />
                  ) : (
                    Array.from(reviewsByResidence.entries()).map(([residenceId, list], index) => {
                      const residence = landlordResidences.find((r) => r.id === residenceId);
                      return (
                        <motion.div
                          key={residenceId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          style={{ marginBottom: "1.25rem" }}
                        >
                          <h4
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#111827",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {residence?.name ?? "Residence"}
                          </h4>
                          <ReviewsList reviews={list} />
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          }

          // maintenance
          return (
            <Card>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>
                  Maintenance Requests {openMaintenanceCount > 0 && `· ${openMaintenanceCount} active`}
                </h3>
              </div>
              <div className={styles.cardBody}>
                {landlordMaintenance.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    style={{ marginBottom: "1rem" }}
                  >
                    <MaintenanceCard
                      request={request}
                      showControls
                      showStudent
                      onStatusChange={handleMaintenanceStatusChange}
                      onPriorityChange={handleMaintenancePriorityChange}
                    />
                  </motion.div>
                ))}
                {landlordMaintenance.length === 0 && (
                  <EmptyState
                    Icon={Wrench}
                    title="No maintenance requests"
                    subtitle="Requests from your approved students will appear here"
                  />
                )}
              </div>
            </Card>
          );
        }}
      </Tabs>

      <AddPropertyDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddProperty}
      />
      <PaymentRequestDialog
        open={!!paymentRequestTarget}
        application={paymentRequestTarget}
        onClose={() => setPaymentRequestTarget(null)}
        onSubmit={handleSubmitPaymentRequest}
      />
    </DashboardShell>
  );
}