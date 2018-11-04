const mongoose = require('mongoose');
// const photosController = require('../controllers/photosController');

///////////////////////////
//Models (the diecast ones)
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
    title: { type: String, required: true, default: 'New Model' },
    modelMfg: { type: String },
    scale: { type: String },
    color: { type: String },
    condition: { type: String, required: true, default: 'Mint' },
    packaging: { type: String, default: 'Mint Card' },
    mfgYear: { type: Number },
    purchaseYear: { type: Number },
    purchasePrice: { type: Number, default: '' },
    estValue: { type: Number, default: '' },
    askingPrice: { type: Number, default: '' },
    status: { type: String, required: true, default: 'Not for sale' },
    notes: { type: String },
    tags: [{ type: String }],
    photo1Url: { type: String, required: true, default: 'https://s3.amazonaws.com/diecastr/placeholders/model-placeholder.svg' },
    photo2Url: { type: String, required: true, default: 'https://s3.amazonaws.com/diecastr/placeholders/model-placeholder.svg' },
    photo3Url: { type: String, required: true, default: 'https://s3.amazonaws.com/diecastr/placeholders/model-placeholder.svg' },
    photo4Url: { type: String, required: true, default: 'https://s3.amazonaws.com/diecastr/placeholders/model-placeholder.svg' },
});

// Allows getters to function on .populate queries
modelSchema.set('toObject', { getters: true });
modelSchema.set('toJSON', { getters: true });

// Getters
modelSchema.path('purchasePrice').get(function (num) {
    if (num !== null)
        return (num / 100).toFixed(2);
});
modelSchema.path('estValue').get(function (num) {
    if (num !== null)
        return (num / 100).toFixed(2);
});
modelSchema.path('askingPrice').get(function (num) {
    if (num !== null)
        return (num / 100).toFixed(2);
});

// Setters
modelSchema.path('purchasePrice').set(function (num) {
    if (num !== '')
        return num * 100;
});
modelSchema.path('estValue').set(function (num) {
    if (num !== '')
        return num * 100;
});
modelSchema.path('askingPrice').set(function (num) {
    if (num !== '')
        return num * 100;
});

// Push new model reference to the user's document
modelSchema.pre('save', function (next) {
    const model = this;
    if (model.isNew) {
        model.model('Users').findOneAndUpdate({ _id: this.userId }, {
            $push: { models: model._id }
        })
            .then(() => {
                return model.model('Collections').findOneAndUpdate({ _id: this.collectionId }, {
                    $push: { models: model._id }
                })
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
            return model.model('Collections').findOneAndUpdate({ _id: this.collectionId }, {
                $pull: { models: model._id }
            })
        })
        .then(() => {
            next();
        })
        .catch((err) => {
            next(err);
        })
});

module.exports = mongoose.model('Models', modelSchema, 'models');