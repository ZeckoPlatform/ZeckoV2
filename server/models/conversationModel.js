const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        type: Map,
        of: String,
        default: new Map()
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ createdAt: -1 });

// Virtual populate messages
conversationSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'conversation'
});

// Pre-save middleware
conversationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
conversationSchema.methods.isParticipant = function(userId) {
    return this.participants.includes(userId);
};

conversationSchema.methods.addParticipant = function(userId) {
    if (!this.participants.includes(userId)) {
        this.participants.push(userId);
    }
    return this.save();
};

conversationSchema.methods.removeParticipant = function(userId) {
    this.participants = this.participants.filter(id => !id.equals(userId));
    return this.save();
};

// Statics
conversationSchema.statics.findByParticipant = function(userId) {
    return this.find({ participants: userId })
        .populate('lastMessage')
        .populate('participants', 'name email')
        .sort('-lastMessageAt');
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 