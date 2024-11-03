export const playNotificationSound = () => {
  try {
    const volume = localStorage.getItem('notificationVolume') || 0.5;
    const audio = new Audio('/notification.mp3');
    audio.volume = parseFloat(volume);
    audio.play().catch(() => {});
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}; 