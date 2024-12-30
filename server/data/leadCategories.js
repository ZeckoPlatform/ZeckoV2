// Define categories without React icons since this is server-side
exports.jobCategories = {
    "Construction & Building": {
        name: "Construction & Building",
        description: "Construction and building services",
        subcategories: ["General Construction", "Renovation", "Plumbing", "Electrical", "Roofing"],
        icon: null
    },
    "Home Services": {
        name: "Home Services",
        description: "Home maintenance and improvement services",
        subcategories: ["Cleaning", "Gardening", "Painting", "Repairs", "Moving"],
        icon: null
    },
    // Add more categories as needed...
};

exports.getAllCategories = () => {
    return Object.keys(exports.jobCategories);
};

exports.getSubcategories = (category) => {
    return exports.jobCategories[category]?.subcategories || [];
}; 