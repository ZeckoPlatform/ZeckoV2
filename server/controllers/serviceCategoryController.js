const ServiceCategory = require('../models/ServiceCategory');

// Function to create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    // Check if category already exists
    const existingCategory = await ServiceCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create new category
    const category = new ServiceCategory({
      name,
      description,
      icon
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Function to get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ active: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}; 
