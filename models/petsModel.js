const mongoose = require('mongoose');

///////////////////////////
//Pet
///////////////////////////

const petSchema = mongoose.Schema({
    // client: { type: String, required: true },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    name: { type: String, required: true },
    type: { type: String, required: true },
    breed: { type: String },
    color: { type: String },
    food: { type: String }
})

// Push new pet reference to the client's document
petSchema.pre('save', function (next) {
    const pet = this;
    if (pet.isNew) {
        pet.model('Users').update({ _id: this.clientId }, {
            $push: { pets: pet._id }
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

// Remove deleted pet's reference from the client's document
petSchema.pre('remove', function (next) {
    const pet = this;
    pet.model('Users').update({ _id: this.clientId }, {
        $pull: { pets: pet._id }
    })
        .then(() => {
            next();
        })
        .catch((err) => {
            next(err);
        })
});

module.exports = mongoose.model('Pets', petSchema, 'pets');