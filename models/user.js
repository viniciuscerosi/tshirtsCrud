const mongoose = require('../database');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    name: {
        type: String,
        required: true,
    }
})

const User = mongoose.model('User', UserSchema);
module.exports = User;