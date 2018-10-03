const mongoose = require('mongoose');

///////////////////////////
//Task
///////////////////////////

const taskSchema = mongoose.Schema({
    // client: { type: String, required: true },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
})

// Push new task reference to the client's document
taskSchema.pre('save', function (next) {
    const task = this;
    if (task.isNew) {
        task.model('Users').update({ _id: this.clientId }, {
            $push: { tasks: task._id }
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

// Remove deleted task's reference from the client's document
taskSchema.pre('remove', function (next) {
    const task = this;
    task.model('Users').update({ _id: this.clientId }, {
        $pull: { tasks: task._id }
    })
        .then(() => {
            next();
        })
        .catch((err) => {
            next(err);
        })
});
module.exports = mongoose.model('Tasks', taskSchema, 'tasks');