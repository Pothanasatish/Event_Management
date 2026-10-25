import api from './api';

export const rsvpService = {
  async submitRSVP(rsvpData) {
    const res = await api.post('/rsvps', rsvpData);
    return res.data;
  },

  async getMyRSVPs(tab = 'upcoming') {
    const res = await api.get('/rsvps/my', { params: { tab } });
    return res.data.data.rsvps;
  },

  async getEventRSVPs(eventId, params = {}) {
    const res = await api.get(`/rsvps/event/${eventId}`, { params });
    return res.data.data;
  },

  async checkInGuest(payload) {
    const res = await api.post('/rsvps/check-in', payload);
    return res.data;
  },

  async manualAddGuest(eventId, guestData) {
    const res = await api.post(`/rsvps/event/${eventId}/manual`, guestData);
    return res.data.data.rsvp;
  },

  async removeGuest(rsvpId) {
    const res = await api.delete(`/rsvps/${rsvpId}`);
    return res.data;
  },

  getExportCSVUrl(eventId) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseURL}/rsvps/event/${eventId}/export`;
  },

  getCalendarICSUrl(eventId) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseURL}/rsvps/calendar/${eventId}`;
  },
};
