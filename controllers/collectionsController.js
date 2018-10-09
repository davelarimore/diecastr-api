const Users = require('../models/usersModel');
const Collections = require('../models/collectionsModel');

//POST: add a collection to authenticated user
exports.collectionsPost = (req, res) => {
    if (req.user._id == req.body.userId) {
        Collections
            .create({
                userId: req.body.userId,
                name: req.body.name,
            })
            .then(collection => {
                res.status(201).json(collection);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}


//PUT: update collection belonging to authenticated user
exports.collectionsUpdate = (req, res) => {
    Users.findById(req.user._id)
        .then((user) => {
            if (user.collections.indexOf(req.params.id) > -1) {
                const requiredFields = ['name'];
                for (let i = 0; i < requiredFields.length; i++) {
                    const field = requiredFields[i];
                    if (!(field in req.body)) {
                        const message = `Missing \`${field}\` in request body`;
                        console.error(message);
                        return res.status(400).send(message);
                    }
                }
                Collections.findOneAndUpdate({
                    _id: req.body._id
                },
                    {
                        name: req.body.name,
                        public: req.body.public,
                    },
                    { new: true }) //returns updated doc
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

// DELETE: delete collection belonging to the authenticated user
exports.collectionsDelete = (req, res) => {
    Users.findById(req.user._id)
        .then((user) => {
            if (user.collections.indexOf(req.params.id) > -1) {
                Collections
                    .findByIdAndRemove(req.params.id)
                    .then(() => {
                        res.status(204).json({ message: 'Collection deleted' });
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