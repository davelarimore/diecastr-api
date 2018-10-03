const mongoose = require('mongoose');

///////////////////////////
//Visit
///////////////////////////

const visitSchema = mongoose.Schema({
    // provider: { type: Number, required: true },
    // client: { type: String, required: true },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    recurrence: { type: String, default: '' }
});

//Pushes new visit references to the client and provider
visitSchema.pre('save', function (next) {
    const visit = this;
    if (visit.isNew) {
        visit.model('Users').update({ _id: this.client }, {
            $push: { visits: visit._id }
        })
            .then(() => {
                return visit.model('Users').update({ _id: this.providerId }, {
                    $push: { visits: visit._id }
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

// Remove deleted visits's reference from client and provider
visitSchema.pre('remove', function (next) {
    const visit = this;
    visit.model('Users').update({ _id: this.client }, {
        $pull: { visits: visit._id }
    })
        .then(() => {
            return visit.model('Users').update({ _id: this.providerId }, {
                $pull: { visits: visit._id }
            })
        })
        .then(() => {
            next();
        })
        .catch((err) => {
            next(err);
        })
});

module.exports = mongoose.model('Visits', visitSchema, 'visits');

