import client from './client';

export const authApi = {
  register: (payload) => client.post('/auth/register', payload),
  login: (payload) => client.post('/auth/login', payload),
  me: () => client.get('/auth/me'),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => client.post('/auth/reset-password', payload),
  updateAvatar: (avatarBase64) => client.patch('/auth/profile/avatar', { avatarBase64 }),
  updateProfile: (payload) => client.patch('/auth/profile', payload),
};

export const disciplineApi = {
  listAll: () => client.get('/disciplines'),
  getBySlug: (slug) => client.get(`/disciplines/${slug}`),
};

export const collectionApi = {
  getBySlug: (slug, page = 1) => client.get(`/collections/${slug}`, { params: { page } }),
};

export const productApi = {
  getBySlug: (slug) => client.get(`/products/${slug}`),
  bestsellers: (limit = 8) => client.get('/products/bestsellers', { params: { limit } }),
  search: (q) => client.get('/products/search', { params: { q } }),
};

export const reviewApi = {
  getForProduct: (productId) => client.get(`/reviews/${productId}/reviews`),
  create: (productId, payload) => client.post(`/reviews/${productId}/reviews`, payload),
};

export const wishlistApi = {
  get: () => client.get('/wishlist'),
  toggle: (productId) => client.post('/wishlist/toggle', { productId }),
};

export const cartApi = {
  get: () => client.get('/cart'),
  addItem: (payload) => client.post('/cart/items', payload),
  updateItem: (itemId, quantity) => client.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => client.delete(`/cart/items/${itemId}`),
  clear: () => client.delete('/cart'),
};

export const giftBoxApi = {
  create: () => client.post('/gift-box'),
  setItems: (id, items) => client.patch(`/gift-box/${id}/items`, { items }),
  addToCart: (id) => client.post(`/gift-box/${id}/add-to-cart`),
};

export const orderApi = {
  checkout: (payload) => client.post('/orders/checkout', payload),
  listMine: () => client.get('/orders'),
  getById: (id) => client.get(`/orders/${id}`),
  track: (orderNumber, phone) => client.get('/orders/track', { params: { orderNumber, phone } }),
};

export const newsletterApi = {
  subscribe: (email) => client.post('/newsletter', { email }),
};

export const settingsApi = {
  get: () => client.get('/settings'),
  update: (payload) => client.patch('/settings', payload),
};

export const couponApi = {
  validate: (code) => client.post('/settings/validate-coupon', { code }),
};
