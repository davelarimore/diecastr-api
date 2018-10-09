const Users = require('../models/usersModel');
const Models = require('../models/modelsModel');

//POST: add a model to authenticated user
exports.modelsPost = (req, res) => {
    if (req.user._id == req.body.userId) {
        Models
            .create({
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
                purchasePrice: req.body.purchasePrice,
                estValue: req.body.estValue,
                qty: req.body.qty,
                status: req.body.status,
                notes: req.body.notes,
                tags: req.body.tags,
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
                const requiredFields = ['title', 'scale', 'condition', 'status'];
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
                        purchasePrice: req.body.purchasePrice,
                        estValue: req.body.estValue,
                        qty: req.body.qty,
                        status: req.body.status,
                        notes: req.body.notes,
                        tags: req.body.tags,
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