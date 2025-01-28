export const ensureArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

export const isValidData = (data) => {
  return data !== null && data !== undefined;
}; 