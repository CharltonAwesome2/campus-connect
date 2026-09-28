// src/pages/studentDashboard/StudentDashboard.jsx
import { useState, useMemo } from "react";
import DashboardShell from "@components/dashboardShell/DashboardShell";
import ResidenceCard from "@components/residenceCard/ResidenceCard";
import ApplicationCard from "@components/applicationCard/ApplicationCard";
import ApplicationDialog from "@components/applicationDialog/ApplicationDialog";
import ReviewDialog from "@components/reviewDialog/ReviewDialog";
import MaintenanceCard from "@components/maintenanceCard/MaintenanceCard";
import MaintenanceRequestDialog from "@components/maintenanceRequestDialog/MaintenanceRequestDialog";
import PaymentsTab from "@components/paymentsTab/PaymentsTab";
import StatCard from "@components/statCard/StatCard";
import EmptyState from "@components/emptyState/EmptyState";
import Card from "@components/card/Card";
import Tabs from "@components/tabs/Tabs";
import Input from "@components/input/Input";
import Select from "@components/select/Select";
import Button from "@components/button/Button";
import { useData } from "@data/DataContext";
import {
  Search,
  Building2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Heart,
  Wrench,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import styles from "./StudentDashboard.module.css";
import { useAuth } from "@context/AuthContext";
import { priceOptions, typeOptions } from "@data/options";

export default function StudentDashboard() {
  const {
    residences,
    applications,
    addApplication,
    payments,
    processPayment,
    favorites,
    addFavorite,
    removeFavorite,
    reviews,
    addReview,
    maintenanceRequests,
    addMaintenanceRequest,
    updateMaintenanceStatus,
  } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [applyTarget, setApplyTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);

  const myApplications = applications.filter((a) => a.studentUserId === user.id);
  const myPayments = payments.filter((p) => p.studentUserId === user.id);

  const appliedResidenceIds = useMemo(() => new Set(myApplications.map((a) => a.residenceId)), [myApplications]);
  const favoriteResidenceIds = useMemo(() => new Set(favorites.map((f) => f.residenceId)), [favorites]);

  const myReviewsByResidence = useMemo(() => {
    const map = new Map();
    reviews.filter((r) => r.studentId === user.studentId).forEach((r) => map.set(r.residenceId, r));
    return map;
  }, [reviews, user.studentId]);

  const reviewsByResidence = useMemo(() => {
    const map = new Map();
    reviews.forEach((r) => {
      if (!map.has(r.residenceId)) map.set(r.residenceId, []);
      map.get(r.residenceId).push(r);
    });
    return map;
  }, [reviews]);

  const myMaintenanceRequests = maintenanceRequests.filter((m) => m.studentUserId === user.id);

  // Residences the student can file a maintenance request for.
  const approvedResidencesForMaintenance = useMemo(() => {
    const approvedIds = new Set(
      myApplications.filter((a) => a.status === "approved").map((a) => a.residenceId),
    );
    return residences
      .filter((r) => approvedIds.has(r.id))
      .map((r) => ({ id: r.id, name: r.name }));
  }, [myApplications, residences]);

  const handleApply = (residenceId) => {
    const residence = residences.find((r) => r.id === residenceId);
    if (!residence) return;

    const already = myApplications.some((a) => a.residenceId === residenceId);
    if (already) {
      toast.error("You already applied for this residence.");
      return;
    }
    setApplyTarget(residence);
  };

  const handleSubmitApplication = async (payload) => {
    try {
      await addApplication(payload);
      toast.success(`Application submitted for ${applyTarget.name}!`, {
        description: "You will be notified once your application is reviewed.",
      });
      setApplyTarget(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit application");
    }
  };

  const handleToggleFavorite = async (residenceId) => {
    const isFav = favoriteResidenceIds.has(residenceId);
    try {
      if (isFav) {
        await removeFavorite(residenceId);
        toast.success("Removed from favorites");
      } else {
        await addFavorite(residenceId);
        toast.success("Saved to favorites");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not update favorites");
    }
  };

  const handleOpenReview = (residence, existingReview) => {
    setReviewTarget({ residence, existingReview: existingReview ?? null });
  };

  const handleSubmitReview = async (payload) => {
    try {
      await addReview(payload);
      toast.success(reviewTarget?.existingReview ? "Review updated" : "Review posted");
      setReviewTarget(null);
    } catch (err) {
      throw err;
    }
  };

  const handleSubmitMaintenanceRequest = async (payload) => {
    try {
      await addMaintenanceRequest(payload);
      toast.success("Maintenance request submitted", {
        description: "Your landlord has been notified.",
      });
      setIsMaintenanceDialogOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleCancelMaintenance = async (id) => {
    try {
      await updateMaintenanceStatus(id, "closed");
      toast.success("Request cancelled");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not cancel request");
    }
  };

  const filteredResidences = residences.filter((residence) => {
    const matchesSearch = residence.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && residence.price < 4000) ||
      (priceFilter === "medium" && residence.price >= 4000 && residence.price < 6000) ||
      (priceFilter === "high" && residence.price >= 6000);
    const matchesType = typeFilter === "all" || residence.type === typeFilter;
    return matchesSearch && matchesPrice && matchesType;
  });

  const favoriteResidences = residences.filter((r) => favoriteResidenceIds.has(r.id));

  const stats = {
    total: myApplications.length,
    pending: myApplications.filter((a) => a.status === "pending").length,
    approved: myApplications.filter((a) => a.status === "approved").length,
    rejected: myApplications.filter((a) => a.status === "rejected").length,
  };

  const statCards = [
    { label: "Total Applications", value: stats.total, Icon: FileText, color: "#2563eb", bg: "#dbeafe" },
    { label: "Pending", value: stats.pending, Icon: Clock, color: "#ca8a04", bg: "#fef9c3" },
    { label: "Approved", value: stats.approved, Icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "Rejected", value: stats.rejected, Icon: XCircle, color: "#dc2626", bg: "#fee2e2" },
  ];

  const tabs = [
    { value: "browse", label: (<><Building2 size={16} /> Browse Residences</>) },
    { value: "favorites", label: (<><Heart size={16} /> Favorites ({favoriteResidences.length})</>) },
    { value: "applications", label: (<><FileText size={16} /> My Applications</>) },
    { value: "maintenance", label: (<><Wrench size={16} /> Maintenance ({myMaintenanceRequests.length})</>) },
    { value: "payments", label: (<><CreditCard size={16} /> My Payments</>) },
  ];

  const renderResidenceGrid = (list, emptyTitle, emptySubtitle) => (
    <>
      <div className={styles.residenceGrid}>
        {list.map((residence, index) => (
          <motion.div
            key={residence.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ResidenceCard
              residence={residence}
              onApply={handleApply}
              hasApplied={appliedResidenceIds.has(residence.id)}
              isFavorite={favoriteResidenceIds.has(residence.id)}
              onToggleFavorite={handleToggleFavorite}
              reviews={reviewsByResidence.get(residence.id) ?? []}
            />
          </motion.div>
        ))}
      </div>

      {list.length === 0 && (
        <Card>
          <EmptyState Icon={Building2} title={emptyTitle} subtitle={emptySubtitle} />
        </Card>
      )}
    </>
  );

  return (
    <DashboardShell role="student" userName={user.name}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.statsGrid}
      >
        {statCards.map(({ label, value, Icon, color, bg }) => (
          <StatCard key={label} label={label} value={value} Icon={Icon} color={color} bg={bg} />
        ))}
      </motion.div>

      <Tabs tabs={tabs} defaultValue="browse">
        {(active) => {
          if (active === "browse") {
            return (
              <div className={styles.tabContent}>
                <Card>
                  <div className={styles.filterBody}>
                    <div className={styles.filterGrid}>
                      <div className={styles.searchWrap}>
                        <Search size={16} className={styles.searchIcon} />
                        <Input
                          placeholder="Search residences..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={styles.searchInput}
                        />
                      </div>
                      <Select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        options={priceOptions}
                      />
                      <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        options={typeOptions}
                      />
                    </div>
                  </div>
                </Card>

                {renderResidenceGrid(filteredResidences, "No residences found matching your criteria")}
              </div>
            );
          }

          if (active === "favorites") {
            return (
              <div className={styles.tabContent}>
                {renderResidenceGrid(
                  favoriteResidences,
                  "No favorites yet",
                  "Tap the heart on any residence to save it here",
                )}
              </div>
            );
          }

          if (active === "applications") {
            return (
              <Card>
                <div className={styles.cardHead}>
                  <h3 className={styles.cardTitle}>Application Status Tracking</h3>
                </div>
                <div className={styles.cardBody}>
                  {myApplications.map((application, index) => (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ApplicationCard
                        application={application}
                        onLeaveReview={(app) => {
                          const residence = residences.find((r) => r.id === app.residenceId);
                          if (!residence) return;
                          handleOpenReview(residence, myReviewsByResidence.get(app.residenceId) ?? null);
                        }}
                        myReview={myReviewsByResidence.get(application.residenceId) ?? null}
                      />
                    </motion.div>
                  ))}
                  {myApplications.length === 0 && (
                    <EmptyState
                      Icon={FileText}
                      title="No applications yet"
                      subtitle="Browse residences and apply to get started"
                    />
                  )}
                </div>
              </Card>
            );
          }

          if (active === "maintenance") {
            return (
              <div className={styles.tabContent}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTitle}>Maintenance Requests</h2>
                  <Button
                    className={styles.addBtn}
                    onClick={() => setIsMaintenanceDialogOpen(true)}
                    disabled={approvedResidencesForMaintenance.length === 0}
                    title={
                      approvedResidencesForMaintenance.length === 0
                        ? "You need an approved application to file a request"
                        : undefined
                    }
                  >
                    <Plus size={16} /> New request
                  </Button>
                </div>

                {myMaintenanceRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    style={{ marginBottom: "1rem" }}
                  >
                    <MaintenanceCard
                      request={request}
                      onCancel={handleCancelMaintenance}
                    />
                  </motion.div>
                ))}

                {myMaintenanceRequests.length === 0 && (
                  <Card>
                    <EmptyState
                      Icon={Wrench}
                      title="No maintenance requests yet"
                      subtitle={
                        approvedResidencesForMaintenance.length === 0
                          ? "Once you're approved for a residence, you can file requests here"
                          : "Click 'New request' to report an issue"
                      }
                    />
                  </Card>
                )}
              </div>
            );
          }

          // payments
          return <PaymentsTab payments={myPayments} processPayment={processPayment} showStudent={false} />;
        }}
      </Tabs>

      <ApplicationDialog
        open={!!applyTarget}
        residence={applyTarget}
        onClose={() => setApplyTarget(null)}
        onSubmit={handleSubmitApplication}
      />

      <ReviewDialog
        open={!!reviewTarget}
        residence={reviewTarget?.residence}
        existingReview={reviewTarget?.existingReview}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleSubmitReview}
      />

      <MaintenanceRequestDialog
        open={isMaintenanceDialogOpen}
        approvedResidences={approvedResidencesForMaintenance}
        onClose={() => setIsMaintenanceDialogOpen(false)}
        onSubmit={handleSubmitMaintenanceRequest}
      />
    </DashboardShell>
  );
}