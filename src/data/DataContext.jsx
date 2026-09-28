// src/data/DataContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { db } from "@lib/data";
import { useAuth } from "@context/AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [residences, setResidences] = useState([]);
  const [applications, setApplications] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setResidences([]);
      setApplications([]);
      setMonthlyData([]);
      setNotifications([]);
      setPayments([]);
      setAmenities([]);
      setFavorites([]);
      setReviews([]);
      setMaintenanceRequests([]);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const [res, apps, monthly, notes, pays, amenityList, favs, revs, maint] = await Promise.all([
          db.getResidences(),
          db.getApplications(),
          db.getMonthlyData(),
          db.getNotifications().catch((err) => {
            console.error("[data] notifications fetch failed", err);
            return [];
          }),
          db.getPayments().catch((err) => {
            console.error("[data] payments fetch failed", err);
            return [];
          }),
          db.getAmenities().catch((err) => {
            console.error("[data] amenities fetch failed", err);
            return [];
          }),
          db.getFavorites().catch((err) => {
            console.error("[data] favorites fetch failed", err);
            return [];
          }),
          db.getReviews().catch((err) => {
            console.error("[data] reviews fetch failed", err);
            return [];
          }),
          db.getMaintenanceRequests().catch((err) => {
            console.error("[data] maintenance fetch failed", err);
            return [];
          }),
        ]);
        if (cancelled) return;
        setResidences(res);
        setApplications(apps);
        setMonthlyData(monthly);
        setNotifications(notes);
        setPayments(pays);
        setAmenities(amenityList);
        setFavorites(favs);
        setReviews(revs);
        setMaintenanceRequests(maint);
      } catch (err) {
        console.error("Failed to load data", err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const addResidence = async (residence) => {
    const updated = await db.addResidence(residence);
    setResidences(updated);
  };

  const removeResidence = async (id) => {
    const updated = await db.removeResidence(id);
    setResidences(updated);
  };

  const updateResidence = async (id, patch) => {
    const updated = await db.updateResidence(id, patch);
    setResidences(updated);
  };

  const addApplication = async (application) => {
    const updated = await db.addApplication(application);
    setApplications(updated);
    setMonthlyData(await db.getMonthlyData());
  };

  const updateApplicationStatus = async (id, status) => {
    const updated = await db.updateApplicationStatus(id, status);
    setApplications(updated);
    setPayments(await db.getPayments());
    setResidences(await db.getResidences());
  };

  const markNotificationRead = async (id) => {
    const updated = await db.markNotificationRead(id);
    setNotifications(updated);
  };

  const markAllNotificationsRead = async () => {
    const updated = await db.markAllNotificationsRead();
    setNotifications(updated);
  };

  const processPayment = async (id, method = "eft") => {
    const updated = await db.processPayment(id, method);
    setPayments(updated);
  };

  const createPaymentRequest = async (payload) => {
    const updated = await db.createPaymentRequest(payload);
    setPayments(updated);
  };

  const addFavorite = async (residenceId) => {
    const updated = await db.addFavorite(residenceId);
    setFavorites(updated);
  };

  const removeFavorite = async (residenceId) => {
    const updated = await db.removeFavorite(residenceId);
    setFavorites(updated);
  };

  const addReview = async (payload) => {
    const updated = await db.addReview(payload);
    setReviews(updated);
  };

  const addMaintenanceRequest = async (payload) => {
    const updated = await db.addMaintenanceRequest(payload);
    setMaintenanceRequests(updated);
  };

  const updateMaintenanceStatus = async (id, status) => {
    const updated = await db.updateMaintenanceStatus(id, status);
    setMaintenanceRequests(updated);
    // Status change may fire a notification for the student.
    setNotifications(await db.getNotifications());
  };

  const updateMaintenancePriority = async (id, priority) => {
    const updated = await db.updateMaintenancePriority(id, priority);
    setMaintenanceRequests(updated);
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  return (
    <DataContext.Provider
      value={{
        residences,
        applications,
        monthlyData,
        notifications,
        amenities,
        unreadCount,
        loading,
        error,
        payments,
        favorites,
        reviews,
        maintenanceRequests,
        processPayment,
        createPaymentRequest,
        addResidence,
        updateResidence,
        removeResidence,
        addApplication,
        updateApplicationStatus,
        markNotificationRead,
        markAllNotificationsRead,
        addFavorite,
        removeFavorite,
        addReview,
        addMaintenanceRequest,
        updateMaintenanceStatus,
        updateMaintenancePriority,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}