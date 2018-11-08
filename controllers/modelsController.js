const Users = require('../models/usersModel');
const Models = require('../models/modelsModel');
const Collections = require('../models/collectionsModel');

// GET get model, accessible by authenticated owner of model
exports.modelsGet = (req, res) => {
    if (req.user._id) {
        Models
            .findOne({ '_id': req.params.id })
            .then(model => {
                if (!model) {
                    return res.status(404)
                }
                res.status(200).json(model);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' })
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

// GET get a public model
exports.modelsGetPublic = (req, res) => {
    Models
        .findOne({ '_id': req.params.id })
        .populate('collectionId', 'public')
        .then(model => {
            if (!model) {
                return res.status(404)
            } else if (model.collectionId.public) {
                res.status(200).json(model);
            } else {
                res.status(403).json('Not authorized to access resource');

            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' })
        });
}

// GET get all models belonging to authenticated user
exports.modelsGetAll = (req, res) => {
    if (req.user._id) {
        Models
            .find({ userId: req.user._id })
            .then(models => {
                res.status(200).json(models);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' })
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

// GET get all models belonging to a collection
exports.modelsGetCollection = (req, res) => {
    Collections
        .findOne({ '_id': req.params.collectionId })
        .then(collection => {
            if (collection.public === true || collection.userId.toString() === req.user._id) {
                Models
                    .find({ collectionId: req.params.collectionId })
                    .then(models => {
                        res.status(200).json(models);
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: 'Internal server error' })
                    });
            } else {
                res.status(403).json('Not authorized to access resource');
            }
        })
}

//POST: add a model to authenticated user
exports.modelsPost = (req, res) => {
    if (req.user._id && req.body.collectionId) {
        Models
            .create({
                userId: req.user._id,
                collectionId: req.body.collectionId,
            })
            .then(model => {
                res.status(201).json(model);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

//PUT: update model belonging to authenticated user
exports.modelsUpdate = (req, res) => {
    Users.findById(req.user._id)
        .then((user) => {
            if (user.models.indexOf(req.params.id) > -1) {
                const requiredFields = ['title', 'condition', 'status'];
                for (let i = 0; i < requiredFields.length; i++) {
                    const field = requiredFields[i];
                    if (!(field in req.body)) {
                        const message = `Missing \`${field}\` in request body`;
                        console.error(message);
                        return res.status(400).send(message);
                    }
                }
                Models.findOneAndUpdate({
                    _id: req.body._id
                },
                    {
                        userId: req.body.userId,
                        collectionId: req.body.collectionId,
                        title: req.body.title,
                        modelMfg: req.body.modelMfg,
                        scale: req.body.scale,
                        color: req.body.color,
                        condition: req.body.condition,
                        packaging: req.body.packaging,
                        mfgYear: req.body.mfgYear,
                        purchaseYear: req.body.purchaseYear,
                        purchasePrice: req.body.purchasePrice || '',
                        estValue: req.body.estValue || '',
                        askingPrice: req.body.askingPrice || '',
                        status: req.body.status,
                        notes: req.body.notes,
                        tags: req.body.tags,
                        photo1Url: req.body.photo1Url,
                        photo2Url: req.body.photo2Url,
                        photo3Url: req.body.photo3Url,
                        photo4Url: req.body.photo4Url,
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
exports.modelsDelete = (req, res) => {
    Users.findById(req.user._id)
        .then((user) => {
            if (user.models.indexOf(req.params.id) > -1) {
                Models
                    .findByIdAndRemove(req.params.id)
                    .then(() => {
                        res.status(204).json({ message: 'Model deleted' });
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