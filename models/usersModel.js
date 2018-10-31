'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

///////////////////////////
//Users
///////////////////////////

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    userName: { type: String, required: true },
    avatarUrl: { type: String, required: true, default: 'https://s3.amazonaws.com/diecastr/placeholders/user-placeholder.svg' },
    collections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collections'
    }],
    models: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Models'
    }],
})

userSchema.methods.serialize = function () {
    return {
        _id: this._id,
        id: this._id.toString(),
        userName: this.userName,
        email: this.email,
        avatarUrl: this.avatarUrl,
        collections: this.collections,
    };
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('Users', userSchema, 'users');