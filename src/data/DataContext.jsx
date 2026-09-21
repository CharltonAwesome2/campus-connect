// src/data/DataContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@lib/data";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [residences, setResidences] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data once on mount
  useEffect(() => {
    async function load() {
      try {
        const [res, apps] = await Promise.all([
          db.getResidences(),
          db.getApplications(),
        ]);
        setResidences(res);
        setApplications(apps);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
        loading,               // optional – useful later
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