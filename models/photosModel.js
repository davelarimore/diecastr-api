const mongoose = require('mongoose');

///////////////////////////
//Photo
///////////////////////////

const photoSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    modelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Models'
    },
    url: { type: String, required: true },
    description: { type: String },
})

// Push new photo reference to the models's document
photoSchema.pre('save', function (next) {
    const photo = this;
    if (photo.isNew) {
        photo.model('Models').findOneAndUpdate({ _id: this.modelId }, {
            $push: { photos: photo._id }
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

// Remove deleted photo's reference from the model's document
photoSchema.pre('remove', function (next) {
    const photo = this;
    photo.model('Models').findOneAndUpdate({ _id: this.modelId }, {
        $pull: { photos: photo._id }
    })
        .then(() => {
            next();
        })
        .catch((err) => {
            next(err);
        })
});

module.exports = mongoose.model('Photos', photoSchema, 'photos');