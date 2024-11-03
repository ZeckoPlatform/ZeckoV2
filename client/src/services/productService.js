import axios from 'axios';
import { API_URL } from '../config/constants';

class ProductService {
  async getProducts(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        params: filters
      });
      return {
        products: response.data?.products || []
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // ... other methods ...
}

export const productService = new ProductService(); 