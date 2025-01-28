const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    ancestors: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true
        }
    }],
    image: {
        url: String,
        alt: String
    },
    icon: String,
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    metadata: {
        seo: {
            title: String,
            description: String,
            keywords: [String]
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ status: 1 });

// Generate slug before saving
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }
    next();
});

// Update ancestors when parent changes
categorySchema.pre('save', async function(next) {
    if (this.isModified('parent')) {
        try {
            if (!this.parent) {
                this.ancestors = [];
            } else {
                const parent = await this.constructor.findById(this.parent);
                if (!parent) throw new Error('Parent category not found');
                
                this.ancestors = [
                    ...parent.ancestors,
                    {
                        _id: parent._id,
                        name: parent.name,
                        slug: parent.slug
                    }
                ];
            }
        } catch (error) {
            next(error);
        }
    }
    next();
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Virtual for products count
categorySchema.virtual('productsCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true
});

// Methods
categorySchema.methods.getFullPath = function() {
    return [...this.ancestors.map(a => a.name), this.name].join(' > ');
};

// Statics
categorySchema.statics.findRoot = function() {
    return this.find({ parent: null });
};

categorySchema.statics.findFeatured = function() {
    return this.find({ featured: true, status: 'active' });
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 