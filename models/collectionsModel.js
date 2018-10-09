const mongoose = require('mongoose');

///////////////////////////
//Collection
///////////////////////////

const collectionSchema = mongoose.Schema({
    name: { type: String, required: true },
    public: { type: Boolean, default: false },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    modelIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Models'
    }],
});


// Push new collection reference to the user's document
collectionSchema.pre('save', function (next) {
    const collection = this;
    if (collection.isNew) {
        collection.model('Users').findOneAndUpdate({ _id: this.userId }, {
            $push: { collections: collection._id }
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

// Remove deleted collection's reference from the user's document
collectionSchema.pre('remove', function (next) {
    const collection = this;
    collection.model('Users').findOneAndUpdate({ _id: this.userId }, {
        $pull: { collections: collection._id }
    })
        .then(() => {
            next();
        })
        .catch((err) => {
            next(err);
        })
});

module.exports = mongoose.model('Collections', collectionSchema, 'collections');