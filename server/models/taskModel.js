const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxLength: [100, 'Task title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Task description cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ dueDate: 1 }, { sparse: true });

// Pre-save middleware
taskSchema.pre('save', function(next) {
    if (this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});

// Instance methods
taskSchema.methods.isOverdue = function() {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && this.status !== 'completed';
};

// Static methods
taskSchema.statics.findOverdueTasks = function(userId) {
    const now = new Date();
    return this.find({
        user: userId,
        dueDate: { $lt: now },
        status: { $ne: 'completed' }
    });
};

taskSchema.statics.findByPriority = function(userId, priority) {
    return this.find({
        user: userId,
        priority: priority
    }).sort('dueDate');
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 