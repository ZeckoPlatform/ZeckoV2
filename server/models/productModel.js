const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'A product must have a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'A product must have a description']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'A product must belong to a category']
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    },
    price: {
        current: {
            type: Number,
            required: [true, 'A product must have a price']
        },
        original: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        discountPercentage: Number
    },
    condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair', 'poor'],
        required: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        isMain: {
            type: Boolean,
            default: false
        },
        order: Number
    }],
    inventory: {
        quantity: {
            type: Number,
            required: true,
            min: [0, 'Quantity cannot be negative']
        },
        sku: String,
        allowBackorder: {
            type: Boolean,
            default: false
        },
        lowStockThreshold: Number
    },
    shipping: {
        methods: [{
            name: String,
            price: Number,
            estimatedDays: String,
            provider: String
        }],
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
                type: String,
                enum: ['cm', 'in'],
                default: 'cm'
            }
        },
        weight: {
            value: Number,
            unit: {
                type: String,
                enum: ['kg', 'lb'],
                default: 'kg'
            }
        },
        freeShipping: {
            type: Boolean,
            default: false
        },
        restrictions: {
            countries: [String],
            message: String
        }
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'sold', 'suspended'],
        default: 'draft'
    },
    bidding: {
        enabled: {
            type: Boolean,
            default: false
        },
        startPrice: Number,
        currentBid: Number,
        minimumBid: Number,
        startTime: Date,
        endTime: Date,
        autoExtend: {
            enabled: Boolean,
            threshold: Number, // minutes
            extension: Number  // minutes
        }
    },
    attributes: [{
        name: String,
        value: String
    }],
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating must be above 0'],
            max: [5, 'Rating must be below 5'],
            set: val => Math.round(val * 10) / 10
        },
        count: {
            type: Number,
            default: 0
        }
    },
    analytics: {
        views: {
            type: Number,
            default: 0
        },
        favorites: {
            type: Number,
            default: 0
        },
        lastViewed: Date
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
productSchema.index({ price: 1, category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ 'bidding.endTime': 1 }, { sparse: true });

// Virtual populate reviews
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id'
});

// Document middleware
productSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true });
    }
    next();
});

// Query middleware
productSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'seller',
        select: 'name email avatar rating'
    }).populate({
        path: 'category',
        select: 'name'
    });
    next();
});

module.exports = mongoose.model('Product', productSchema);
