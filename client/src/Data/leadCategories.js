// Client-side categories (with the same data structure as server)
export const jobCategories = {
  "construction-&-building": {
    name: "Construction & Building",
    description: "Professional construction, renovation, and building services",
    icon: "FaHardHat",
    subcategories: [
      "General Contractors",
      "Architects",
      "Structural Engineers",
      "Electricians",
      "Plumbers",
      "Carpenters",
      "Bricklayers",
      "Plasterers",
      "Painters & Decorators",
      "Roofers",
      "Flooring Specialists",
      "HVAC Engineers",
      "Glaziers",
      "Scaffolders",
      "Foundation Specialists",
      "Steel Fixers",
      "Concrete Specialists",
      "Drywall Contractors",
      "Insulation Installers",
      "Building Surveyors",
      "Project Managers",
      "Site Managers",
      "Construction Equipment Operators",
      "Demolition Specialists",
      "Environmental Consultants",
      "Asbestos Removal",
      "Solar Panel Installers",
      "Waterproofing Specialists",
      "Stonemasonry",
      "Timber Frame Specialists",
      "Fire Protection Services",
      "Building Automation Specialists",
      "Crane Operators",
      "Civil Engineers",
      "Quantity Surveyors"
    ]
  },
  "Professional Services": {
    name: "Professional Services",
    description: "Expert professional, legal, and consulting services for individuals and businesses of all sizes",
    icon: "FaUser",
    subcategories: [
      "Lawyers & Solicitors",
      "Accountants",
      "Financial Advisors",
      "Business Consultants",
      "Tax Consultants",
      "Estate Agents",
      "Property Surveyors",
      "Insurance Brokers",
      "Mortgage Advisors",
      "Investment Advisors",
      "Patent Attorneys",
      "Notaries",
      "HR Consultants",
      "Management Consultants",
      "Marketing Consultants",
      "PR Specialists",
      "Business Coaches",
      "Risk Assessors",
      "Forensic Accountants",
      "Actuaries",
      "Corporate Trainers",
      "Business Analysts",
      "Wealth Managers",
      "Immigration Consultants",
      "Economic Advisors",
      "Data Protection Officers",
      "Compliance Consultants",
      "Environmental Consultants",
      "Energy Assessors",
      "Procurement Specialists",
      "Bid Writers",
      "Grant Writers",
      "Corporate Investigators",
      "Expert Witnesses",
      "Mediators"
    ]
  },
  "Home Improvement": {
    name: "Home Improvement",
    description: "Comprehensive home renovation and improvement services for interior and exterior transformations",
    icon: "FaHome",
    subcategories: [
      "Bathroom Installation",
      "Kitchen Installation",
      "Carpentry & Joinery",
      "Painting & Decorating",
      "Plastering & Rendering",
      "Flooring Installation",
      "Tiling",
      "Windows & Doors",
      "Handyman Services",
      "Electrical Installation",
      "Plumbing",
      "Roofing",
      "Guttering & Fascias",
      "Conservatories & Orangeries",
      "Loft Conversions",
      "Extensions & Conversions",
      "Garage Conversions",
      "Insulation Installation",
      "Damp Proofing",
      "Structural Work",
      "Smart Home Installation",
      "Home Theater Setup",
      "Custom Furniture Making",
      "Cabinet Making",
      "Staircase Installation",
      "Soundproofing",
      "Basement Conversion",
      "Garden Room Construction",
      "Accessibility Modifications",
      "Energy Efficiency Upgrades"
    ]
  },
  "Home Services": {
    name: "Home Services",
    description: "Professional home maintenance, improvement, and repair services",
    icon: "FaHome",
    subcategories: [
      "House Cleaning",
      "Gardening & Landscaping",
      "Pest Control",
      "Window Cleaning",
      "Carpet Cleaning",
      "Appliance Repair",
      "Furniture Assembly",
      "Handyman Services",
      "Painting & Decorating",
      "Plumbing Services",
      "Electrical Services",
      "HVAC Services",
      "Locksmith Services",
      "Moving Services",
      "Storage Solutions",
      "Home Security",
      "Pool Maintenance",
      "Gutter Cleaning",
      "Pressure Washing",
      "Chimney Sweeping",
      "Driveway Maintenance",
      "Fence Installation",
      "Deck & Patio Services",
      "Home Staging",
      "Interior Design"
    ]
  },
  // ... (copying all other categories from server/data/leadCategories.js)
};

// Helper functions
export const getAllCategories = () => {
  return Object.entries(jobCategories).map(([id, category]) => ({
    _id: id,
    name: category.name,
    description: category.description,
    subcategories: category.subcategories,
    icon: category.icon,
    active: true
  }));
};

export const getSubcategories = (categoryId) => {
  return jobCategories[categoryId]?.subcategories || [];
};

export const validateCategory = (categoryId) => {
  return Boolean(jobCategories[categoryId]);
};

export const validateSubcategory = (categoryId, subcategory) => {
  return jobCategories[categoryId]?.subcategories?.includes(subcategory) || false;
};

export const getCategoryById = (categoryId) => {
  const category = jobCategories[categoryId];
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