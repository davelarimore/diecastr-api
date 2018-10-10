'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

///////////////////////////
//User
///////////////////////////

const userSchema = mongoose.Schema({
    userName: { type: String, required: true, default: '' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    collections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collections'
    }],
    models: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Models'
    }],
})

// Virtual to generate full name
// userSchema.virtual('fullName').get(function () {
//     return `${this.firstName} ${this.lastName}`.trim();
// });

userSchema.methods.serialize = function () {
    return {
        _id: this._id,
        userName: this.userName,
        email: this.email,
        collections: this.collections,
        models: this.models,
    };
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('Users', userSchema, 'users');