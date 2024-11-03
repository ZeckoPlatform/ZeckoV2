export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    return audio.play();
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}; 