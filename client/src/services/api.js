import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    verify: '/auth/verify'
  },
  users: {
    profile: '/users/profile',
    update: '/users/update'
  },
  leads: {
    list: '/leads',
    get: (id) => `/leads/${id}`,
    create: '/leads',
    update: (id) => `/leads/${id}`,
    delete: (id) => `/leads/${id}`,
    latest: '/leads/latest'
  }
};

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add CSRF token to all requests
const setupCSRFToken = async () => {
    try {
        const response = await fetch('/api/csrf-token');
        const { csrfToken } = await response.json();
        
        // Add CSRF token to all subsequent requests
        axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }
};

// Call this when the app initializes
setupCSRFToken();

// Add credit-related API calls
export const getCreditBalance = async () => {
  try {
    const response = await axios.get('/api/credits/balance');
    return response.data;
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const response = await axios.get('/api/credits/transactions');
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const createPaymentIntent = async (amount) => {
  try {
    const response = await axios.post('/api/credits/create-payment-intent', { amount });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmCreditPurchase = async (paymentIntentId, amount) => {
  try {
    const response = await axios.post('/api/credits/confirm-purchase', {
      paymentIntentId,
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming credit purchase:', error);
    throw error;
  }
};

// Add review-related API calls
export const getLeadReview = async (leadId) => {
  try {
    const response = await axios.get(`/api/reviews/lead/${leadId}`);
    return response.data;
  } catch (error) {
    console.error('Get lead review error:', error);
    throw error;
  }
};

export const createLeadReview = async (leadId, reviewData) => {
  try {
    const response = await axios.post(`/api/reviews/lead/${leadId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Create lead review error:', error);
    throw error;
  }
};

export const getContractorReviews = async (contractorId) => {
  try {
    const response = await axios.get(`/api/reviews/contractor/${contractorId}`);
    return response.data;
  } catch (error) {
    console.error('Get contractor reviews error:', error);
    throw error;
  }
};

export const reportReview = async (reviewId, reportData) => {
  try {
    const response = await axios.post(`/api/reviews/${reviewId}/report`, reportData);
    return response.data;
  } catch (error) {
    console.error('Report review error:', error);
    throw error;
  }
};

// Add payment-related API calls
export const createCheckoutSession = async (priceId) => {
    try {
        const response = await axios.post('/api/payments/create-checkout-session', { priceId });
        return response.data;
    } catch (error) {
        console.error('Create checkout session error:', error);
        throw error;
    }
};

// Add payment history and subscription management endpoints
export const getPaymentHistory = async () => {
    try {
        const response = await axios.get('/api/payments/history');
        return response.data;
    } catch (error) {
        console.error('Get payment history error:', error);
        throw error;
    }
};

export const getSubscriptionDetails = async () => {
    try {
        const response = await axios.get('/api/payments/subscription');
        return response.data;
    } catch (error) {
        console.error('Get subscription details error:', error);
        throw error;
    }
};

export const cancelSubscription = async () => {
    try {
        const response = await axios.post('/api/payments/subscription/cancel');
        return response.data;
    } catch (error) {
        console.error('Cancel subscription error:', error);
        throw error;
    }
};

export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/api/dashboard/user-stats');
  return response.data;
};

export const getVendorStats = async () => {
  const response = await api.get('/api/dashboard/vendor-stats');
  return response.data;
};

export const getBusinessStats = async () => {
  const response = await api.get('/api/dashboard/business-stats');
  return response.data;
};

// General profile functions
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/api/profile', profileData);
  return response.data;
};

export const uploadAvatar = async (formData) => {
  const response = await api.post('/api/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Business profile functions
export const updateBusinessProfile = async (profileData) => {
  const response = await api.put('/api/profile/business', profileData);
  return response.data;
};

export const addBusinessAddress = async (addressData) => {
  const response = await api.post('/api/profile/business/addresses', addressData);
  return response.data;
};

export const updateBusinessAddress = async (addressId, addressData) => {
  const response = await api.put(`/api/profile/business/addresses/${addressId}`, addressData);
  return response.data;
};

export const deleteBusinessAddress = async (addressId) => {
  await api.delete(`/api/profile/business/addresses/${addressId}`);
};

// Vendor profile functions
export const updateVendorProfile = async (profileData) => {
  const response = await api.put('/api/profile/vendor', profileData);
  return response.data;
};

export const addVendorAddress = async (addressData) => {
  const response = await api.post('/api/profile/vendor/addresses', addressData);
  return response.data;
};

export const updateVendorAddress = async (addressId, addressData) => {
  const response = await api.put(`/api/profile/vendor/addresses/${addressId}`, addressData);
  return response.data;
};

export const deleteVendorAddress = async (addressId) => {
  await api.delete(`/api/profile/vendor/addresses/${addressId}`);
};

// Shared address functions
export const setDefaultAddress = async (addressId) => {
  const response = await api.put(`/api/profile/addresses/${addressId}/default`);
  return response.data;
};

// 2FA Setup - Generates QR code and backup codes
export const setup2FA = async () => {
    try {
        const response = await axios.post('/api/2fa/setup');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to setup 2FA');
    }
};

// 2FA Verification - Verifies the code and enables 2FA
export const verify2FA = async (token) => {
    try {
        const response = await axios.post('/api/2fa/verify', { token });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Invalid verification code');
    }
};

// 2FA Validation during login
export const validate2FA = async (token, userId) => {
    try {
        const response = await axios.post('/api/2fa/validate', { token, userId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Invalid verification code');
    }
};

// Disable 2FA
export const disable2FA = async () => {
    try {
        const response = await axios.post('/api/2fa/disable');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to disable 2FA');
    }
};

export default api;