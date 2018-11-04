const Users = require('../models/usersModel');
const Collections = require('../models/collectionsModel');

// GET: get user's collection with user info, no models
exports.collectionsGet = (req, res) => {
    if (req.user._id) {
        Collections
            .findOne({ '_id': req.params.id, userId: req.user._id })
            .populate('userId', 'userName avatarUrl')
            .then(collection => {
                res.status(200).json(collection);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' })
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

// GET: get user's OWN collection with basic model info, paginated
exports.collectionsGetModelList = (req, res) => {
    const pageNo = parseInt(req.query.pageNo);
    const size = parseInt(req.query.size);
    const skip = size * (pageNo - 1);
    let modelCount = '';

    if (req.user._id) {

        // get model count in collection
        Collections.findOne({ userId: req.user._id })
            .populate('models', '_id')
            .exec(function (countError, countResult) {
                modelCount = countResult.models.length;

                // get a page of models from the collection
                Collections
                    .findOne({ userId: req.user._id })
                    .populate({
                        path: 'models',
                        //limit model info populated
                        select: 'title scale modelMfg photo1Url status',
                        //paginate results
                        options: { limit: size, skip: skip }
                    })
                    .then(collection => {
                        const pageTotal = Math.ceil(modelCount / size);
                        collection.pageTotal = pageTotal;
                        res.status(200).json(collection);
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: 'Internal server error' })
                    });
            })


    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

// GET: get user's PUBLIC collection with basic model info, paginated
exports.collectionsGetPublicModelList = (req, res) => {
    const pageNo = parseInt(req.query.pageNo);
    const size = parseInt(req.query.size);
    const skip = size * (pageNo - 1);
    let modelCount = '';

    if (req.query.id) {

        // get model count in collection
        Collections.findOne({ _id: req.query.id })
            .populate('models', '_id')
            .exec(function (countError, countResult) {
                modelCount = countResult.models.length;

                // get a page of models from the collection
                Collections
                    .findOne({ _id: req.query.id })
                    .populate({
                        path: 'models',
                        //limit model info populated
                        select: 'title scale modelMfg photo1Url status',
                        //paginate results
                        options: { limit: size, skip: skip }
                    })
                    .then(collection => {
                        const pageTotal = Math.ceil(modelCount / size);
                        collection.pageTotal = pageTotal;
                        res.status(200).json(collection);
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ message: 'Internal server error' })
                    });
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

// GET: get all user's collections
exports.collectionsGetAll = (req, res) => {
    if (req.user._id) {
        Collections
            .find({ userId: req.user._id })
            .populate('userId', 'userName avatarUrl')
            .then(collections => {
                res.status(200).json(collections);
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' })
            });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

// GET: get all public collections with user info, no models
exports.collectionsGetAllPublic = (req, res) => {
    Collections
        .find({ public: true }, { models: 0 })
        .populate('userId', 'userName avatarUrl')
        .then(collections => {
            res.status(200).json(collections);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' })
        });
}

//POST: add a collection to authenticated user
exports.collectionsPost = (req, res) => {
    if (req.user._id === req.body.userId.toString()) {
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
                const requiredFields = [];
                for (let i = 0; i < requiredFields.length; i++) {
                    const field = requiredFields[i];
                    if (!(field in req.body)) {
                        const message = `Missing \`${field}\` in request body`;
                        console.error(message);
                        return res.status(400).send(message);
                    }
                }
                Collections.findOneAndUpdate({
                    _id: req.params.id
                },
                    {
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