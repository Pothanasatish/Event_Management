import api from './api';

export const eventService = {
  async getEvents(params = {}) {
    const res = await api.get('/events', { params });
    return res.data.data;
  },

  async getFeaturedEvents() {
    const res = await api.get('/events/featured');
    return res.data.data.events;
  },

  async getEventById(idOrSlug) {
    const res = await api.get(`/events/${idOrSlug}`);
    return res.data.data.event;
  },

  async getRelatedEvents(eventId) {
    const res = await api.get(`/events/${eventId}/related`);
    return res.data.data.events;
  },

  async createEvent(eventFormData) {
    const res = await api.post('/events', eventFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.event;
  },

  async updateEvent(id, eventFormData) {
    const res = await api.put(`/events/${id}`, eventFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.event;
  },

  async cancelEvent(id) {
    const res = await api.put(`/events/${id}/cancel`);
    return res.data;
  },

  async duplicateEvent(id) {
    const res = await api.post(`/events/${id}/duplicate`);
    return res.data.data.event;
  },

  async deleteEvent(id) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};
