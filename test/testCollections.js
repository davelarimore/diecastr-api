'use strict';
const { TEST_DATABASE_URL } = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const Users = require('../models/usersModel');
const Collections = require('../models/collectionsModel');

const expect = chai.expect;

chai.use(chaiHttp);

//Helpers
function login(email, password) {
    return chai
        .request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .then((res) => {
            return res.body.authToken;
        })
}

//Tests
describe('Protected collections endpoint', function () {
    const email = 'exampleUser@test.biz';
    const password = 'examplePass';
    const userName = 'Example';
    let createdUserId = '';
    let createdCollectionId = '';

    const name = 'Test collection';

    before(function () {
        return runServer(TEST_DATABASE_URL)
            .then(() => {
                return Users.hashPassword(password).then(password =>
                    Users.create({
                        email,
                        password,
                        userName
                    })
                        .then(user => {
                            createdUserId = user.id;
                        })
                );
            })
    });

    after(function () {
        return Users.deleteMany({})
            .then(() => closeServer())
    });

    describe('/api/collections', function () {
        it(`Should post a collection`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .post('/api/collections')
                        .set('authorization', `Bearer ${token}`)
                        .send({
                            userId: createdUserId,
                            name
                        })
                        .then(res => {
                            createdCollectionId = res.body._id;
                            expect(res).to.have.status(201);
                            expect(res.body).to.be.an('object');
                            expect(res.body.userId).to.deep.equal(createdUserId);
                            expect(res.body.name).to.deep.equal(name);
                        });
                })
        });
        it(`Should prevent unauthorized user from posting a collection`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .post('/api/collections')
                        .set('authorization', `Bearer ${token}`)
                        .send({
                            userId: '12345',
                            name
                        })
                        .then(res => {
                            expect(res).to.have.status(403);
                        });
                })
        });
        it(`Should return a user's collection with user info`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/collections/${createdCollectionId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.name).to.deep.equal(name);
                        });
                })
        });
        it(`Should prevent unauthorized user from getting collection`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/collections/${createdCollectionId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(401);
                        });
                })
        });
        it(`Should return a user's collection with basic model info`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/collections/${createdCollectionId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.name).to.deep.equal(name);
                        });
                })
        });
        it(`Should return all user's collections`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get('/api/collections')
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('array');
                        });
                })
        });
        it(`Should prevent unauthorized user from getting all user's collections`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return chai
                        .request(app)
                        .get('/api/collections')
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(401);
                        });
                })
        });
        it(`Should update collection`, function () {
            const updateData = {
                _id: createdCollectionId,
                public: true,
            };
            return login(email, password)
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .put(`/api/collections/${createdCollectionId}`)
                            .set('authorization', `Bearer ${token}`)
                            .send(updateData)
                            .then((res) => {
                                expect(res).to.have.status(200);
                                expect(res.body).to.be.a("object");
                                expect(res.body.public).to.deep.equal(updateData.public);
                            })
                    );
                })
        });
        it(`Should prevent unauthorized user from updating collection`, function () {
            const updateData = {
                _id: createdCollectionId,
                name: 'foo',
            };
            return login(email, 'wrongPassword')
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .put(`/api/collections/${createdCollectionId}`)
                            .set('authorization', `Bearer ${token}`)
                            .send(updateData)
                            .then((res) => {
                                expect(res).to.have.status(401);
                            })
                    );
                })
        });
        it(`Should delete collection`, function () {
            return login(email, password)
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .delete(`/api/collections/${createdCollectionId}`)
                            .set('authorization', `Bearer ${token}`)
                            .then(function (res) {
                                expect(res).to.have.status(204);
                            })
                    );
                })
        });
        it(`Should prevent unauthorized user from deleting collection`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .delete(`/api/collections/${createdCollectionId}`)
                            .set('authorization', `Bearer ${token}`)
                            .then(function (res) {
                                expect(res).to.have.status(401);
                            })
                    );
                })
        });
    });
});