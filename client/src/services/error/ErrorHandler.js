import { toast } from 'react-toastify';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

export const errorHandler = {
  handle: (error, notificationSystem = toast) => {
    console.error('Error caught:', error);

    if (error instanceof ApiError) {
      return handleApiError(error, notificationSystem);
    }

    if (error.response) {
      return handleAxiosError(error, notificationSystem);
    }

    // Network errors, timeouts, etc.
    return handleGenericError(error, notificationSystem);
  }
};

const handleApiError = (error, notificationSystem) => {
  const message = getErrorMessage(error);
  
  switch (error.status) {
    case 401:
      notificationSystem.error('Session expired. Please login again.');
      // Redirect to login if needed
      break;
    case 403:
      notificationSystem.error('You do not have permission to perform this action.');
      break;
    case 404:
      notificationSystem.error('The requested resource was not found.');
      break;
    case 422:
      notificationSystem.error('Invalid data provided. Please check your input.');
      break;
    default:
      notificationSystem.error(message);
  }

  return {
    success: false,
    message,
    status: error.status,
    code: error.code
  };
};

const handleAxiosError = (error, notificationSystem) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || getErrorMessage(error);

  switch (status) {
    case 400:
      notificationSystem.error('Invalid request. Please check your data.');
      break;
    case 401:
      notificationSystem.error('Authentication required. Please login.');
      break;
    case 403:
      notificationSystem.error('Access denied.');
      break;
    case 404:
      notificationSystem.error('Resource not found.');
      break;
    case 422:
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        Object.values(validationErrors).forEach(error => {
          notificationSystem.error(error);
        });
      } else {
        notificationSystem.error(message);
      }
      break;
    case 429:
      notificationSystem.error('Too many requests. Please try again later.');
      break;
    case 500:
      notificationSystem.error('Server error. Please try again later.');
      break;
    default:
      notificationSystem.error('An unexpected error occurred.');
  }

  return {
    success: false,
    message,
    status,
    data: error.response?.data
  };
};

const handleGenericError = (error, notificationSystem) => {
  const message = getErrorMessage(error);
  notificationSystem.error(message);

  return {
    success: false,
    message,
    status: 500
  };
};

const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  return error.message || 'An unexpected error occurred';
}; 