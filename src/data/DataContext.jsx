// src/data/DataContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@lib/data";
import { useAuth } from "@context/AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [residences, setResidences] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Reload whenever the auth user changes (login/logout)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [res, apps] = await Promise.all([
          db.getResidences(),
          db.getApplications(),
        ]);
        if (!cancelled) {
          setResidences(res);
          setApplications(apps);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]); // re-run when auth identity changes

  const addResidence = async (residence) => {
    const updated = await db.addResidence(residence);
    setResidences(updated);
  };

  const removeResidence = async (id) => {
    const updated = await db.removeResidence(id);
    setResidences(updated);
  };

  const addApplication = async (application) => {
    const updated = await db.addApplication(application);
    setApplications(updated);
  };

  const updateApplicationStatus = async (id, status) => {
    const updated = await db.updateApplicationStatus(id, status);
    setApplications(updated);
  };

  return (
    <DataContext.Provider
      value={{
        residences,
        applications,
        loading,
        addResidence,
        removeResidence,
        addApplication,
        updateApplicationStatus,
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