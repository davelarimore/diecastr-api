"use strict";
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/diecastr';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test-diecastr';

exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET || '123';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

//CORS
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN_URL || 'http://localhost:3000';

// S3
exports.S3_BUCKET = "diecastr",
exports.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
exports.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;