import api from './api';

export const analyticsService = {
  async getOrganizerAnalytics() {
    const res = await api.get('/analytics/organizer');
    return res.data.data;
  },

  async getAdminAnalytics() {
    const res = await api.get('/analytics/admin');
    return res.data.data;
  },
};

export const categoryService = {
  async getCategories() {
    const res = await api.get('/categories');
    return res.data.data.categories;
  },

  async createCategory(catData) {
    const res = await api.post('/categories', catData);
    return res.data.data.category;
  },

  async updateCategory(id, catData) {
    const res = await api.put(`/categories/${id}`, catData);
    return res.data.data.category;
  },

  async deleteCategory(id) {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};
