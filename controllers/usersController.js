'use strict';

const Users = require('../models/usersModel');

////////////////////////////////
//AUTHENTICATED PROVIDERS ONLY
////////////////////////////////

// GET handled by getMe()

////////////////////////////////
// ALL AUTHENTICATED USERS
////////////////////////////////

// GET users/me: - get my client object only, accessible by any authenticated user
exports.usersGetMe = (req, res) => {
    Users
        .findOne({ '_id': req.user._id })
        .populate('pets')
        .populate({ path: 'visits', populate: {path: 'client', model: 'Users'}, options: { sort: { startTime: 1 } } })
        .populate('tasks')
        .populate('provider')
        .populate({ path: 'clients', populate: { path: 'tasks', model: 'Tasks' } })
        .populate({ path: 'clients', populate: { path: 'pets', model: 'Pets' } })
        .populate({ path: 'clients', populate: { path: 'visits', model: 'Visits' }, options: { sort: { startTime: 1 } } })
        .then(user => {
            res.status(200).json(user.serialize());
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' })
        });
}

//PUT: update client or client of provider
exports.usersPut = (req, res) => {
    if (req.user._id === req.body._id || req.user.clients.includes(req.body._id)) {
        const requiredFields = ['firstName', 'lastName', 'phone', 'addressString'];
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i];
            if (!(field in req.body)) {
                const message = `Missing \`${field}\` in request body`;
                console.error(message);
                return res.status(400).send(message);
            }
        }
        Users.findOneAndUpdate({
            _id: req.body._id
            },
            {
            companyName: req.body.companyName,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            addressString: req.body.addressString,
            entryNote: req.body.entryNote,
            vetInfo: req.body.vetInfo
            },
            { new: true }) //returns updated doc
            .then(response => {
                res.json(response);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' })
            })
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

//DELETE: delete client of provider
exports.usersDelete = (req, res) => {
    if (req.user.clients.includes(req.params.id)) {
        Users.findByIdAndRemove(req.params.id)
            .then(() => {
                res.status(204).json({ message: 'User deleted' });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}