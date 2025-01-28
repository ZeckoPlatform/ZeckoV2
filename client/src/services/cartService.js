export const fetchCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { items: [] };
    }

    const response = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        return { items: [] };
      }
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    return data || { items: [] };
  } catch (error) {
    console.error('Cart fetch error:', error);
    return { items: [] };
  }
};

export const removeFromCart = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`/api/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
}; 