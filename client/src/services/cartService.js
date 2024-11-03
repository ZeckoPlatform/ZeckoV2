export const fetchCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { items: [] }; // Return empty cart if no token
    }

    const response = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized - maybe clear token and redirect to login
        localStorage.removeItem('token');
        return { items: [] };
      }
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cart fetch error:', error);
    return { items: [] }; // Return empty cart on error
  }
}; 