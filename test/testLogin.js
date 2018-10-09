'use strict';
const { TEST_DATABASE_URL } = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const Users = require('../models/usersModel');
const { JWT_SECRET } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Auth endpoints', function () {
    const email = 'exampleUser@app.biz';
    const password = 'examplePass';
    const userName = 'gabbadob';

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
        return closeServer();
    });

    beforeEach(function () {
        return Users.hashPassword(password).then(password =>
            Users.create({
                email,
                password,
                userName
            })
        );
    });

    afterEach(function () {
        return Users.deleteMany({});
    });
//helper function for running auth test on all endpoints

    describe('/auth/login', function () {
        it('Should reject requests with no credentials', function () {
            return chai
                .request(app)
                .post('/auth/login')
                .then((res) => {
                    expect(res).to.have.status(400);
                })
        });
        it('Should reject requests with incorrect emails', function () {
            return chai
                .request(app)
                .post('/auth/login')
                .send({ email: 'wrongEmail', password })
                .then((res) => {
                    expect(res).to.have.status(401);
                })
            });
        it('Should reject requests with incorrect passwords', function () {
            return chai
                .request(app)
                .post('/auth/login')
                .send({ email, password: 'wrongPassword' })
                .then((res) => {
                    expect(res).to.have.status(401);
                })
            });
        it('Should return a valid auth token', function () {
            return chai
                .request(app)
                .post('/auth/login')
                .send({ email, password })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const payload = jwt.verify(token, JWT_SECRET, {
                        algorithm: ['HS256']
                    });
                    expect(payload.user.email).to.deep.equal(email);
                    expect(payload.user.userName).to.deep.equal(userName);
                });
        });
    });
});
