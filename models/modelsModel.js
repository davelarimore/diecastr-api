const mongoose = require('mongoose');

///////////////////////////
//Model (the diecast one)
///////////////////////////

const modelSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collections'
    },
    title: { type: String, required: true },
    modelMfg: { type: String },
    scale: { type: String, required: true },
    color: { type: String },
    condition: { type: String, required: true },
    packaging: { type: String },
    mfgYear: { type: Number },
    purchaseYear: { type: Number },
    purchasePrice: { type: Number },
    estValue: { type: Number },
    qty: { type: Number },
    status: { type: String, required: true },
    notes: { type: String },
    tags: [{ type: String }],
    photos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photos'
    },
});

// Push new model reference to the user's document
modelSchema.pre('save', function (next) {
    const model = this;
    if (model.isNew) {
        model.model('Users').findOneAndUpdate({ _id: this.userId }, {
            $push: { models: model._id }
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

// Remove deleted model's reference from the user's document
modelSchema.pre('remove', function (next) {
    const model = this;
    model.model('Users').findOneAndUpdate({ _id: this.userId }, {
        $pull: { models: model._id }
    })
        .then(() => {
            next();
        })
        .catch((err) => {
            next(err);
        })
});

module.exports = mongoose.model('Models', modelSchema, 'model');