// This should be the main categories file
const categories = {
  "construction-&-building": {
    name: "Construction & Building",
    description: "Professional construction, renovation, and building services",
    icon: "FaHardHat",
    subcategories: [
      "General Contractors",
      "Architects",
      "Structural Engineers",
      // ... other subcategories
    ]
  },
  // ... other categories
};

export const jobCategories = categories;

export const getAllCategories = () => {
  return Object.entries(categories).map(([id, category]) => ({
    _id: id,
    name: category.name,
    description: category.description,
    subcategories: category.subcategories,
    icon: category.icon,
    active: true
  }));
};

export const getSubcategories = (categoryId) => {
  return categories[categoryId]?.subcategories || [];
};

export const validateCategory = (categoryId) => {
  return Boolean(categories[categoryId]);
};

export const validateSubcategory = (categoryId, subcategory) => {
  return categories[categoryId]?.subcategories?.includes(subcategory) || false;
};

export const getCategoryById = (categoryId) => {
  const category = categories[categoryId];
  if (!category) return null;
  
  return {
    _id: categoryId,
    name: category.name,
    description: category.description,
    subcategories: category.subcategories,
    icon: category.icon,
    active: true
  };
};