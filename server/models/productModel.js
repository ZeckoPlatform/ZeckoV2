const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    price: {
        regular: {
            type: Number,
            required: true
        },
        sale: {
            type: Number,
            default: null
        },
        saleEndDate: Date
    },
    images: [{
        url: String,
        alt: String,
        isMain: {
            type: Boolean,
            default: false
        }
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
        required: true
    },
    stock: {
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        sku: {
            type: String,
            unique: true,
            sparse: true
        },
        manageStock: {
            type: Boolean,
            default: true
        },
        lowStockThreshold: {
            type: Number,
            default: 5
        }
    },
    attributes: [{
        name: String,
        value: String
    }],
    variations: [{
        attributes: [{
            name: String,
            value: String
        }],
        price: {
            regular: Number,
            sale: Number
        },
        stock: {
            quantity: Number,
            sku: String
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'private'],
        default: 'draft'
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    shipping: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        shippingClass: String,
        freeShipping: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});

// Indexes
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ 'stock.sku': 1 });

module.exports = mongoose.model('Product', productSchema);
