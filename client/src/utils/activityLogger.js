import { activityLogService } from '../services/activityLogService';

// Single declaration of ActivityTypes
export const ActivityTypes = {
  LOGIN: 'login',
  SECURITY: 'security',
  PROFILE: 'profile',
  ORDER: 'order',
  OTHER: 'other'
};

export const logActivity = async (type, description, metadata = {}) => {
  try {
    if (!Object.values(ActivityTypes).includes(type)) {
      console.warn(`Invalid activity type: ${type}`);
      type = ActivityTypes.OTHER;
    }

    const activityData = {
      type,
      description,
      timestamp: new Date().toISOString(),
      metadata,
      save: true // Indicate this should be saved to database
    };

    await activityLogService.logActivity(activityData);
    
    // If socket is connected, it will handle real-time updates
    console.log('Activity logged successfully:', activityData);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw the error - just log it
  }
};

// Usage example comment (not code):
/*
Example usage:
logActivity(ActivityTypes.LOGIN, 'User logged in', { userId: '123' });
logActivity(ActivityTypes.SECURITY, 'Password changed');
logActivity(ActivityTypes.PROFILE, 'Profile updated');
logActivity(ActivityTypes.ORDER, 'Order placed', { orderId: '456' });
*/