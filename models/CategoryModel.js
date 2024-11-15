const mongoose = require('mongoose');

// Category schema definition
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

// Creating the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
