const Users = require('../models/usersModel');
const Pets = require('../models/petsModel');

//POST: add a pet to client or client of provider
exports.petsPost = (req, res) => {
    Users.findById(req.user._id).populate('clients')
        .then((user) => {
            if (user._id == req.body.clientId || user.clients.some((client) => { return client.id === req.body.clientId })) {
                Pets
                    .create({
                        clientId: req.body.clientId,
                        name: req.body.name,
                        type: req.body.type,
                        breed: req.body.breed,
                        color: req.body.color,
                        food: req.body.food,
                    })
                    .then(pet => {
                        res.status(201).json(pet);
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

//PUT: update pet belonging to client or client of provider
exports.petsUpdate = (req, res) => {
    Users.findById(req.user._id).populate('clients')
        .then((user) => {
            if (user.pets.includes(req.params.id) || user.clients.filter(client => client.pets.includes(req.params.id))) {
                const requiredFields = ['name', 'type', 'breed', 'color', 'food'];
                for (let i = 0; i < requiredFields.length; i++) {
                    const field = requiredFields[i];
                    if (!(field in req.body)) {
                        const message = `Missing \`${field}\` in request body`;
                        console.error(message);
                        return res.status(400).send(message);
                    }
                }
                Pets.findOneAndUpdate({
                    _id: req.body._id
                },
                    {
                        name: req.body.name,
                        type: req.body.type,
                        breed: req.body.breed,
                        color: req.body.color,
                        food: req.body.food
                    },
                    { new: true }) //returns update doc
                    .then(response => {
                        res.status(200).json(response);
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: 'Internal server error' })
                    })
            } else {
                res.status(403).json('Not authorized to access resource');
            }
        })
};

// DELETE: delete pet belonging to the authenticated client
exports.petsDelete = (req, res) => {
    Users.findById(req.user._id).populate('clients')
        .then((user) => {
            if (user.pets.includes(req.params.id) || user.clients.filter(client => client.pets.includes(req.params.id))) {
                Pets
                    .findByIdAndRemove(req.params.id)
                    .then(() => {
                        res.status(204).json({ message: 'Pet deleted' });
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