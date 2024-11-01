import { activityLogService } from '../services/activityLogService';

export const logActivity = async (type, description) => {
  try {
    await activityLogService.logActivity({
      type,
      description,
      timestamp: new Date().toISOString(),
      ip: window.clientIP // You'll need to set this somewhere
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Usage examples:
export const ActivityTypes = {
  LOGIN: 'login',
  SECURITY: 'security',
  PROFILE: 'profile',
  ORDER: 'order'
}; 