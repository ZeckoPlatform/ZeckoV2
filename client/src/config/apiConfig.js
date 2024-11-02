const getApiUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return 'https://zeckov2-deceb43992ac.herokuapp.com';
};

export const API_URL = getApiUrl(); 