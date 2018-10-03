'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

///////////////////////////
//User
///////////////////////////

const userSchema = mongoose.Schema({
    firstName: { type: String, required: true, default: '' },
    lastName: { type: String, required: true, default: '' },
    companyName: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    vetInfo: { type: String, default: '' },
    addressString: { type: String, default: '' },
    latLon: { type: String, default: '' },
    entryNote: { type: String, default: '' },
    role: { type: String, required: true, default: 'client' },
    password: { type: String, required: true, select: false },
    pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pets' }],
    visits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visits' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tasks' }],
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
})

// Virtual to generate full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.methods.serialize = function () {
    return {
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        companyName: this.companyName,
        email: this.email,
        phone: this.phone,
        vetInfo: this.vetInfo,
        addressString: this.addressString,
        latLon: this.latLon,
        entryNote: this.entryNote,
        role: this.role,
        pets: this.pets,
        visits: this.visits,
        tasks: this.tasks,
        providerId: this.providerId,
        clients: this.clients
    };
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

// Push new client references to their provider's document
userSchema.pre('save', function (next) {
    const user = this;
    if (user.role === 'client' && user.isNew) {
        user.model('Users').update({ _id: this.providerId }, {
            $push: { clients: user._id }
        })
            .then(() => {
                next();
            })
            .catch((err) => {
                next(err);
            })
    } else {
        next();
    }
});

// Pull deleted client and visits references from their provider's document
userSchema.pre('remove', function (next) {
    const user = this;
    if (user.role === 'client') {
        user.model('Users').update({ _id: this.providerId }, {
            $pull: { clients: user._id },
        })
            .then(() => {
                next();
            })
            .catch((err) => {
                next(err);
            })
    } else {
        next();
    }
});

module.exports = mongoose.model('Users', userSchema, 'users');