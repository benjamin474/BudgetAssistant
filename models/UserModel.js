
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, required: true, unique: true },// Ensure email is unique and required
    password: { type: String, required: true }, // Password should be required
});

// Hash the password before saving it to the database
userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        try {
            // Hash password if it is new or has been modified
            this.password = await bcrypt.hash(this.password, 10);
        } catch (err) {
            next(err);  // Propagate error if any during hashing
        }
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
