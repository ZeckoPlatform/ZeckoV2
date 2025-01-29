/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @returns {string} The formatted number string
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @returns {string} The formatted percentage string
 */
export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
}; 