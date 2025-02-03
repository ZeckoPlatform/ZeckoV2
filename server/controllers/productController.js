const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');

class ProductController {
    createProduct = catchAsync(async (req, res) => {
        const { title, description, price, category } = req.body;
        
        // Handle image uploads
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                imageUrls = await Promise.all(
                    req.files.map(async (file) => {
                        // Convert buffer to base64
                        const b64 = Buffer.from(file.buffer).toString('base64');
                        const dataURI = `data:${file.mimetype};base64,${b64}`;
                        
                        const result = await cloudinary.uploader.upload(dataURI, {
                            folder: 'products',
                            resource_type: 'auto'
                        });
                        return result.secure_url;
                    })
                );
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                throw new ApiError('Image upload failed', 500);
            }
        }

        const product = await Product.create({
            title,
            description,
            price: {
                current: price.current
            },
            category,
            images: imageUrls,
            seller: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: product
        });
    });

    // ... rest of the methods remain the same ...
}

const productController = new ProductController();
module.exports = productController;