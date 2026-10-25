import api from './api';

export const inviteService = {
  async bulkSend(eventId, emails) {
    const res = await api.post(`/invites/${eventId}/bulk`, { emails });
    return res.data;
  },

  async getInvites(eventId) {
    const res = await api.get(`/invites/${eventId}`);
    return res.data.data.invites;
  },

  async getInviteByToken(token) {
    const res = await api.get(`/invites/token/${token}`);
    return res.data.data;
  },

  async respondToInvite(token, payload) {
    const res = await api.post(`/invites/token/${token}/respond`, payload);
    return res.data;
  },
};
