const notificationSound = new Audio('/notification.mp3');

// Add volume management
const DEFAULT_VOLUME = 0.5;

export const playNotificationSound = () => {
  const isMuted = localStorage.getItem('notificationsMuted') === 'true';
  if (!isMuted) {
    const volume = localStorage.getItem('notificationVolume') || DEFAULT_VOLUME;
    notificationSound.volume = parseFloat(volume);
    notificationSound.play().catch(error => {
      console.log('Sound play failed:', error);
    });
  }
};

export const toggleNotificationSound = () => {
  const currentState = localStorage.getItem('notificationsMuted') === 'true';
  localStorage.setItem('notificationsMuted', !currentState);
  return !currentState;
};

export const isNotificationMuted = () => {
  return localStorage.getItem('notificationsMuted') === 'true';
};

export const setNotificationVolume = (volume) => {
  localStorage.setItem('notificationVolume', volume);
  notificationSound.volume = volume;
};

export const getNotificationVolume = () => {
  return parseFloat(localStorage.getItem('notificationVolume')) || DEFAULT_VOLUME;
};

// Add a test sound function
export const playTestSound = () => {
  const volume = getNotificationVolume();
  notificationSound.volume = volume;
  notificationSound.play().catch(error => {
    console.log('Test sound play failed:', error);
  });
}; 