import apiClient from './client';

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await apiClient.post('/cart/items', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await apiClient.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },

  applyCoupon: async (code) => {
    const response = await apiClient.post('/cart/coupon', { code });
    return response.data;
  },
}; 