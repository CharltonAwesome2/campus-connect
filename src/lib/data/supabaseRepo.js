// src/lib/data/supabaseRepo.js
// Thin composition of the domain modules. Every existing
// `import { supabaseRepo } from "@lib/data"` keeps working.
import { residencesRepo } from "./residences";
import { applicationsRepo } from "./applications";
import { paymentsRepo } from "./payments";
import { notificationsRepo } from "./notifications";
import { favoritesRepo } from "./favorites";
import { reviewsRepo } from "./reviews";
import { maintenanceRepo } from "./maintenance";
import { amenitiesRepo } from "./amenities";

export const supabaseRepo = {
  // residences
  getResidences: (...a) => residencesRepo.getResidences(...a),
  addResidence: (...a) => residencesRepo.addResidence(...a),
  updateResidence: (...a) => residencesRepo.updateResidence(...a),
  removeResidence: (...a) => residencesRepo.removeResidence(...a),

  // applications
  getApplications: (...a) => applicationsRepo.getApplications(...a),
  addApplication: (...a) => applicationsRepo.addApplication(...a),
  updateApplicationStatus: (...a) => applicationsRepo.updateApplicationStatus(...a),
  getMonthlyData: (...a) => applicationsRepo.getMonthlyData(...a),

  // payments
  getPayments: (...a) => paymentsRepo.getPayments(...a),
  processPayment: (...a) => paymentsRepo.processPayment(...a),
  createPaymentRequest: (...a) => paymentsRepo.createPaymentRequest(...a),

  // notifications
  getNotifications: (...a) => notificationsRepo.getNotifications(...a),
  markNotificationRead: (...a) => notificationsRepo.markNotificationRead(...a),
  markAllNotificationsRead: (...a) => notificationsRepo.markAllNotificationsRead(...a),

  // favorites
  getFavorites: (...a) => favoritesRepo.getFavorites(...a),
  addFavorite: (...a) => favoritesRepo.addFavorite(...a),
  removeFavorite: (...a) => favoritesRepo.removeFavorite(...a),

  // reviews
  getReviews: (...a) => reviewsRepo.getReviews(...a),
  addReview: (...a) => reviewsRepo.addReview(...a),

  // maintenance
  getMaintenanceRequests: (...a) => maintenanceRepo.getMaintenanceRequests(...a),
  addMaintenanceRequest: (...a) => maintenanceRepo.addMaintenanceRequest(...a),
  updateMaintenanceStatus: (...a) => maintenanceRepo.updateMaintenanceStatus(...a),
  updateMaintenancePriority: (...a) => maintenanceRepo.updateMaintenancePriority(...a),

  // amenities
  getAmenities: (...a) => amenitiesRepo.getAmenities(...a),
};