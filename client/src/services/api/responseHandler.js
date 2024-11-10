import { errorHandler } from '../error/ErrorHandler';

export const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    return {
      success: true,
      data: response.data,
      message: response.data?.message
    };
  } catch (error) {
    return errorHandler.handle(error);
  }
};

export const createApiService = (baseService) => {
  return Object.entries(baseService).reduce((acc, [key, fn]) => {
    acc[key] = async (...args) => {
      return handleApiResponse(() => fn(...args));
    };
    return acc;
  }, {});
}; 