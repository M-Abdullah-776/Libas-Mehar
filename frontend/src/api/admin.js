import client from './client';

const adminApi = {
  // Stats
  getStats: () => client.get('/admin/stats'),

  // Products
  getProducts: () => client.get('/admin/products'),
  createProduct: (data) => client.post('/admin/products', data),
  updateProduct: (id, data) => client.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`),

  // Orders
  getOrders: () => client.get('/admin/orders'),
  updateOrderStatus: (id, status) => client.patch(`/admin/orders/${id}/status`, { status }),

  // Users
  getUsers: () => client.get('/admin/users'),
  createUser: (data) => client.post('/admin/users', data),
  updateUserRole: (id, role) => client.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),

  // Collections
  getCollections: () => client.get('/admin/collections'),
  createCollection: (data) => client.post('/admin/collections', data),
  updateCollection: (id, data) => client.patch(`/admin/collections/${id}`, data),
  deleteCollection: (id) => client.delete(`/admin/collections/${id}`),

  // Newsletter
  getNewsletterSubscribers: () => client.get('/admin/newsletter'),
  sendNewsletter: (payload) => client.post('/admin/newsletter/send', payload),

  // Coupons
  createCoupon: (data) => client.post('/settings/coupons', data),
  deleteCoupon: (code) => client.delete(`/settings/coupons/${code}`),
};

export default adminApi;
