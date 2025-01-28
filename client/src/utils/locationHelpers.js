export const formatLocation = (location) => {
  if (!location) return '';
  
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);
  
  return parts.join(', ') || '';
};

export const validateLocation = (location) => {
  if (!location) return false;
  return Boolean(location.city || location.state || location.country);
};

export const getLocationDisplay = (location) => {
  try {
    return formatLocation(location);
  } catch (error) {
    console.error('Error formatting location:', error);
    return '';
  }
}; 