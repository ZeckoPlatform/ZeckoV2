const ServiceCategory = require('../models/serviceCategoryModel');
const { validateRequest } = require('../utils/validator');
const { jobCategories } = require('../data/leadCategories');

exports.createCategory = async (req, res) => {
    try {
        const { error } = validateRequest(req.body, {
            name: 'required|string',
            description: 'required|string',
            icon: 'string',
            subcategories: 'array',
            questions: 'array'
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const category = new ServiceCategory(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        // Convert jobCategories object to array format expected by client
        const formattedCategories = Object.entries(jobCategories).map(([key, category]) => ({
            _id: key.toLowerCase().replace(/\s+/g, '-'),
            name: category.name,
            description: category.description,
            subcategories: category.subcategories || [],
            active: true
        }));

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json(formattedCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await ServiceCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await ServiceCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
