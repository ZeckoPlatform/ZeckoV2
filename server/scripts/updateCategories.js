require('dotenv').config();
const mongoose = require('mongoose');
const { jobCategories } = require('../data/leadCategories');

// Add this line to suppress the deprecation warning
mongoose.set('strictQuery', false);

// Connect to your MongoDB with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const CategorySchema = new mongoose.Schema({
  _id: String,
  name: String,
  description: String,
  subcategories: [String],
  icon: String
});

const Category = mongoose.model('Category', CategorySchema);

async function updateCategories() {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Create new categories with formatted IDs
    const categories = Object.entries(jobCategories).map(([id, category]) => ({
      _id: id.toLowerCase().replace(/[&\s]+/g, '-'),
      name: category.name,
      description: category.description,
      subcategories: category.subcategories,
      icon: category.icon
    }));
    
    console.log('Preparing to insert categories:', categories);
    await Category.insertMany(categories);
    console.log('Categories updated successfully');
    
    // Verify the update
    const updatedCategories = await Category.find({});
    console.log('Updated categories:', updatedCategories);
  } catch (error) {
    console.error('Error updating categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateCategories(); 