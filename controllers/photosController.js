const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const multiparty = require('multiparty');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = require('../config');

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

// configure AWS to work with promises
AWS.config.setPromisesDependency(Promise);

// create S3 instance
const s3 = new AWS.S3();

// abstracts function to upload a file returning a promise
const uploadFile = (buffer, name, type) => {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: 'diecastr',
        ContentType: type.mime,
        Key: `${name}.${type.ext}`
    };
    return s3.upload(params).promise();
};

// POST: add a photo
exports.photosPost = (req, res) => {
    console.log('uploading photo');
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
        if (error) throw new Error(error);
        try {
            const path = files.file[0].path;
            const buffer = fs.readFileSync(path);
            const type = fileType(buffer);
            const timestamp = Date.now().toString();
            const fileName = `userImages/${timestamp}-lg`;
            const data = await uploadFile(buffer, fileName, type)
            console.log(data);
            return res.status(200).send(data);
        } catch (error) {
            return res.status(400).send(error);
        }
    });
};

// DELETE: delete a photo
exports.photosDelete = (req, res) => {
    const params = {
        Bucket: 'diecastr',
        Key: `userImages/${req.body.name}`,
    };
    console.log('deleting: ', req.body.name)
    s3.deleteObject(params).promise()
        .then(() => {
            res.status(204).send();
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
}