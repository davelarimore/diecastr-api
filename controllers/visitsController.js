const Users = require('../models/usersModel');
const Visits = require('../models/visitsModel');

//POST: add a visit for the client of an authenticated provider
exports.visitsPost = (req, res) => {
    Users.findById(req.user._id).populate('clients')
        .then((user) => {
            if (user.clients.some((client) => { return client.id === req.body.client })) {
                Visits
                    .create({
                        providerId: req.body.providerId,
                        client: req.body.client,
                        startTime: req.body.startTime,
                        endTime: req.body.endTime,
                        recurrence: req.body.recurrence,
                    })
                    .then(() => {
                        //get provider and return their populated doc
                        return Users.findOne({ '_id': req.body.providerId })
                            .populate('pets')
                            .populate({ path: 'visits', populate: { path: 'client', model: 'Users' }, options: { sort: { startTime: -1 } } })
                            .populate('tasks')
                            .populate('provider')
                            .populate('clients')
                    })
                    .then(user => res.status(201).json(user))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: 'Internal server error' });
                    });
            } else {
                res.status(403).json('Not authorized to access resource');
            }
        })
}

// DELETE: delete a visit for the client of an authenticated provider (client's can't delete visits)
exports.visitsDelete = (req, res) => {
    Users.findById(req.user._id).populate('visits')
        .then((user) => {
            if (user.visits.some((visit) => { return visit.id === req.params.id })) {
                Visits
                    .findByIdAndRemove(req.params.id)
                    .then(() => {
                        res.status(204).json({ message: 'Visit deleted' });
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

// DELETE: delete all visits for the client of an authenticated provider (client's can't delete visits)
exports.visitsDeleteAll = (req, res) => {
    Users.findById(req.user._id).populate('clients') //make helper
        .then((user) => {
            if (user.clients.some((client) => { return client.id === req.params.id })) {
                Visits
                    .remove({ client: req.params.id })
                    .then(() => {
                        res.status(204).json({ message: 'Visits deleted' });
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