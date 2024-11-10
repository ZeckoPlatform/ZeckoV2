import apiClient from './client';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  },

  updateAvatar: async (imageFile) => {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    
    const response = await apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAddresses: async () => {
    const response = await apiClient.get('/users/addresses');
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await apiClient.post('/users/addresses', addressData);
    return response.data;
  },

  updateAddress: async (id, addressData) => {
    const response = await apiClient.put(`/users/addresses/${id}`, addressData);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await apiClient.delete(`/users/addresses/${id}`);
    return response.data;
  },

  getOrders: async (params) => {
    const response = await apiClient.get('/users/orders', { params });
    return response.data;
  },
}; 