const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('../config');

const createAuthToken = function (user) {
    return jwt.sign({ user }, config.JWT_SECRET, {
        subject: user.email,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

require('../models/petsModel');
require('../models/visitsModel');
require('../models/petsModel');
const Users = require('../models/usersModel');

const localAuth = passport.authenticate('local', { session: false });

// Authenticate
exports.authenticate = (req, res, next) => {
    const authToken = createAuthToken(req.user.serialize());
    const role = req.user.role;
    res.status(200).json({ authToken, role });
};

// Signup
exports.signup = (req, res) => {

    const requiredFields = ['email', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['email', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    // Reject untrimed credentials
    const explicityTrimmedFields = ['email', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Email and password must not contain spaces',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        email: {
            min: 1
        },
        password: {
            min: 10,
            // bcrypt truncates after 72 characters
            max: 72
        }
    };
    const tooSmallField = Object.keys(sizedFields).find(
        field =>
            'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
            'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${sizedFields[tooSmallField]
                    .min} characters long`
                : `Must be at most ${sizedFields[tooLargeField]
                    .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let {
        email,
        password,
        firstName = '',
        lastName = '',
        role,
        companyName,
        phone,
        addressString,
        vetInfo,
        entryNote,
        providerId
    } = req.body;
    // Username and password come in pre-trimmed, otherwise we throw an error
    // before this
    firstName = firstName.trim();
    lastName = lastName.trim();

    return Users.find({ email })
        .count()
        .then(count => {
            if (count > 0) {
                // There is an existing user with the same email
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Email is already taken',
                    location: 'email'
                });
            }
            // If there is no existing user, hash the password
            return Users.hashPassword(password);
        })
        .then(hash => {
            return Users.create({
                email,
                password: hash,
                firstName,
                lastName,
                companyName,
                role,
                phone,
                addressString,
                vetInfo,
                entryNote,
                providerId
            });
        })
        .then((user) => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            // Forward validation errors on to the client, otherwise give a 500
            // error because something unexpected has happened
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ code: 500, message: 'Internal server error' });
        });
};

// GET providers for signup screen
exports.authGetProviders = (req, res) => {
    Users
        .find({ 'role': 'provider' })
        .then(users => {
            res.status(201).json(users);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' })
        });
}
