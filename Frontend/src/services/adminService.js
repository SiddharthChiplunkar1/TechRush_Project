import { api } from "@/lib/api";

const unwrap = (response) => response.data?.data ?? response.data;

const adminService = {
  listUsers: ({ page = 0, size = 20 } = {}) =>
    api.get("/api/admin/users", { params: { page, size } }).then(unwrap),
  listLockedUsers: () => api.get("/api/admin/users/locked").then(unwrap),
  unlockUser: (userId) =>
    api.post(`/api/admin/users/${encodeURIComponent(userId)}/unlock`).then(unwrap),
  revokeUserSessions: (userId) =>
    api.post(`/api/admin/users/${encodeURIComponent(userId)}/revoke-sessions`).then(unwrap),
  getLoginMethods: () => api.get("/api/admin/stats/login-methods").then(unwrap),
  getFailedLogins: (hours = 24) =>
    api.get("/api/admin/stats/failed-logins", { params: { hours } }).then(unwrap),
  getNewUsers: () => api.get("/api/admin/stats/new-users").then(unwrap),
  getActiveSessions: (userId) =>
    api.get(`/api/admin/users/${encodeURIComponent(userId)}/sessions`).then(unwrap),
};

export { adminService };
