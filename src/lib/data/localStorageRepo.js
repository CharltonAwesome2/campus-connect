// src/lib/data/localStorageRepo.js
import {
  residences as mockResidences,
  applications as mockApplications,
} from "@/data/mock-data";

const KEYS = {
  residences: "campus_residences",
  applications: "campus_applications",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback); // avoid mutating the mock
    }
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const localStorageRepo = {
  async getResidences() {
    return load(KEYS.residences, mockResidences);
  },

  async getApplications() {
    return load(KEYS.applications, mockApplications);
  },

  async addResidence(residence) {
    const all = await this.getResidences();
    const updated = [...all, residence];
    save(KEYS.residences, updated);
    return updated;
  },

  async removeResidence(id) {
    const all = await this.getResidences();
    const updated = all.filter((r) => r.id !== id);
    save(KEYS.residences, updated);
    return updated;
  },

  async addApplication(application) {
    const all = await this.getApplications();
    const updated = [...all, application];
    save(KEYS.applications, updated);
    return updated;
  },

  async updateApplicationStatus(id, status) {
    const all = await this.getApplications();
    const updated = all.map((a) => (a.id === id ? { ...a, status } : a));
    save(KEYS.applications, updated);
    return updated;
  },
};