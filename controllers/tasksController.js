const Users = require('../models/usersModel');
const Tasks = require('../models/tasksModel');

//GET is handled by getMe

//POST: add task to the authenticated client or client of provider
exports.tasksPost = (req, res) => {
    Users.findById(req.user._id).populate('clients')
        .then((user) => {
            if (user._id == req.body.clientId || user.clients.some((client) => { return client.id === req.body.clientId })) {
                Tasks
                    .create({
                        clientId: req.body.clientId,
                        description: req.body.description,
                    })
                    .then(task => {
                        res.status(201).json(task);
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: 'Internal server error' });
                    });
            } else {
                res.status(403).json('Not authorized to access resource');
            }
        })
}

// DELETE: delete task belonging to the client or client of provider
exports.tasksDelete = (req, res) => {
    Users.findById(req.user._id).populate('clients').populate('tasks')
        .then((user) => {
            if (user.tasks.includes(req.params.id) || user.clients.filter(client => client.tasks.includes(req.params.id))) {
                Tasks
                    .findByIdAndRemove(req.params.id)
                    .then(() => {
                        res.status(204).json({ message: 'Task deleted' });
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: 'Internal server error' });
                    });
            } else {
                res.status(403).json('Not authorized to access resource');
            }
        })
}