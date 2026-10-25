import api from './api';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('eventhub_token', res.data.token);
      localStorage.setItem('eventhub_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('eventhub_token', res.data.token);
      localStorage.setItem('eventhub_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('eventhub_token');
      localStorage.removeItem('eventhub_user');
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token, password) {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  },
};
