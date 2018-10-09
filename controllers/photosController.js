const Models = require('../models/modelsModel');
const Photos = require('../models/photosModel');

//POST: add a photo

exports.photosPost = (req, res) => {
    if (req.user._id == req.body.userId) {
    Photos
        .create({
            userId: req.body.userId,
            modelId: req.body.modelId,
            url: req.body.url,
            description: req.body.description,
        })
        .then(photo => {
            res.status(201).json(photo);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        });
    } else {
        res.status(403).json('Not authorized to access resource');
    }
}

//PUT: update photo belonging to a model
exports.photosUpdate = (req, res) => {
    Photos.findById(req.params.id)
        .then((photo) => {
            if (photo.userId.toString() == req.user._id) {
                const requiredFields = ['url'];
                for (let i = 0; i < requiredFields.length; i++) {
                    const field = requiredFields[i];
                    if (!(field in req.body)) {
                        const message = `Missing \`${field}\` in request body`;
                        console.error(message);
                        return res.status(400).send(message);
                    }
                }
                Photos.findOneAndUpdate({
                    _id: req.body._id
                },
                    {
                        url: req.body.url,
                        description: req.body.description,
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

// DELETE: delete photo belonging to a model
exports.photosDelete = (req, res) => {
    Photos.findById(req.params.id)
        .then((photo) => {
            if (photo.userId.toString() == req.user._id) {
                Photos
                    .findByIdAndRemove(req.params.id)
                    .then(() => {
                        res.status(204).json({ message: 'Photo deleted' });
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