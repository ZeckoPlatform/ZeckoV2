import { emitActivity } from '../utils/socket.io';

export const logActivity = async (type, description, metadata = {}) => {
  try {
    // Emit the activity through socket for real-time updates
    emitActivity({
      type,
      description,
      metadata,
      timestamp: new Date().toISOString()
    });

    // Also save to database through REST API
    const response = await fetch('/api/user/activity-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        type,
        description,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to log activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
}; 