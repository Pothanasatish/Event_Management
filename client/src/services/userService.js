import api from './api';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data.data.user;
  },

  async updateProfile(profileData) {
    const res = await api.put('/users/profile', profileData);
    return res.data.data.user;
  },

  async changePassword(passwords) {
    const res = await api.put('/users/change-password', passwords);
    return res.data;
  },

  async getSavedEvents() {
    const res = await api.get('/users/saved-events');
    return res.data.data.events;
  },

  async toggleSaveEvent(eventId) {
    const res = await api.post(`/users/saved-events/${eventId}`);
    return res.data.data;
  },

  // Admin user management
  async adminGetUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  async adminUpdateRole(userId, role) {
    const res = await api.put(`/admin/users/${userId}/role`, { role });
    return res.data.data.user;
  },

  async adminToggleStatus(userId) {
    const res = await api.put(`/admin/users/${userId}/toggle-status`);
    return res.data.data.user;
  },

  async adminDeleteUser(userId) {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  async adminToggleFeatured(eventId) {
    const res = await api.put(`/admin/events/${eventId}/toggle-featured`);
    return res.data.data.event;
  },
};
