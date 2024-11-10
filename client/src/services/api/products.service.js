import apiClient from './client';

export const productsService = {
  getProducts: async (params) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  uploadProductImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 