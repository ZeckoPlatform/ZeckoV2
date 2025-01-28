const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validation');
const categoryController = require('../controllers/serviceCategoryController');
const { body, param, query } = require('express-validator');

const categoryValidations = [
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('description').trim().isLength({ min: 10, max: 500 }),
    body('parentId').optional().isMongoId(),
    body('icon').optional().isURL(),
    body('metadata').optional().isObject(),
    body('status').optional().isIn(['active', 'inactive']),
    validationMiddleware.handleValidationErrors
];

router.get('/', [
    query('includeInactive').optional().isBoolean(),
    query('parentId').optional().isMongoId(),
    validationMiddleware.handleValidationErrors
], categoryController.getCategories);

router.post('/', categoryValidations, categoryController.createCategory);

router.put('/:categoryId', [
    param('categoryId').isMongoId(),
    ...categoryValidations
], categoryController.updateCategory);

router.get('/:categoryId/subcategories', [
    param('categoryId').isMongoId(),
    validationMiddleware.handleValidationErrors
], categoryController.getSubcategories);

module.exports = router; 
