'use strict';

const Users = require('../models/usersModel');
const Collections = require('../models/collectionsModel');

////////////////////////////////
// ALL AUTHENTICATED USERS
////////////////////////////////

// GET users/me: - get user, accessible by any authenticated user
exports.usersGetMe = (req, res) => {
    Users
        .findOne({ '_id': req.user._id })
        .populate('collections')
        .populate('models', 'scale purchasePrice estValue status')
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' })
        });
}

//PUT: update user
exports.usersPut = (req, res) => {
    if (req.user._id === req.body._id) {
        const requiredFields = ['userName'];
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i];
            if (!(field in req.body)) {
                const message = `Missing \`${field}\` in request body`;
                console.error(message);
                return res.status(400).send(message);
            }
        }
        let finalRepsonse = '';
        Users.findOneAndUpdate({
            _id: req.body._id
        },
            {
                userName: req.body.userName,
                avatarUrl: req.body.avatarUrl,
            },
            { new: true }) //returns updated doc
            .populate('models', 'scale purchasePrice estValue status')
            .then(response => {
                finalRepsonse = response;
                // update colleciton name based on new user name
                Collections.findOneAndUpdate(
                    { userId: response._id },
                    { $set: { name: response.userName + "'s collection" }
                })
                .then(
                   res.json(finalRepsonse)
                )
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' })
            })
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

//DELETE: delete user
exports.usersDelete = (req, res) => {
    Users.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({ message: 'User deleted' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });

}