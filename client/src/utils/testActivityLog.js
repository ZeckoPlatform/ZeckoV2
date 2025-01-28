import { emitActivity } from './socket.io';

export const testActivityUpdate = () => {
  const testActivities = [
    {
      type: 'login',
      description: 'Test login from Chrome',
      timestamp: new Date().toISOString()
    },
    {
      type: 'security',
      description: 'Test security settings update',
      timestamp: new Date().toISOString()
    },
    {
      type: 'profile',
      description: 'Test profile update',
      timestamp: new Date().toISOString()
    }
  ];

  let index = 0;
  
  // Emit a test activity every 3 seconds
  const interval = setInterval(() => {
    if (index >= testActivities.length) {
      clearInterval(interval);
      return;
    }
    
    emitActivity(testActivities[index]);
    index++;
  }, 3000);

  return () => clearInterval(interval); // cleanup function
}; 