import axios from 'axios';
import { API_URL } from '../config/constants';

class ProductService {
  async getProducts(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        params: filters
      });
      
      console.log('Raw API Response:', response.data); // Debug log
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return { products: response.data };
      }
      
      if (response.data?.products) {
        return response.data;
      }
      
      return { products: [] };
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  }

  // ... other methods ...
}

export const productService = new ProductService(); 