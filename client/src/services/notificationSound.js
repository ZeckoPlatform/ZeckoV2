export const playNotificationSound = () => {
  try {
    let volume = 0.5; // Default volume
    
    try {
      const storedVolume = localStorage.getItem('notificationVolume');
      if (storedVolume !== null) {
        volume = parseFloat(storedVolume);
      }
    } catch (error) {
      console.error('Error reading volume from localStorage:', error);
    }

    const audio = new Audio('/notification.mp3');
    audio.volume = Math.min(Math.max(volume, 0), 1); // Ensure volume is between 0 and 1
    
    // Handle autoplay restrictions
    audio.play().catch((error) => {
      console.warn('Could not play notification sound:', error);
    });
  } catch (error) {
    console.error('Error in playNotificationSound:', error);
  }
}; 