'use strict';
const { TEST_DATABASE_URL } = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const Users = require('../models/usersModel');
const Collections = require('../models/collectionsModel');
const Models = require('../models/modelsModel');

const expect = chai.expect;

chai.use(chaiHttp);

//Helpers
function login(email, password) {
    return chai
        .request(app)
        .post('/auth/login')
        .send({ email, password })
        .then((res) => {
            return res.body.authToken;
        })
}

//Tests
describe('Protected models endpoint', function () {
    const email = 'exampleUser@test.biz';
    const password = 'examplePass';
    const userName = 'Example';
    let createdUserId = '';
    let createdModelId = '';
    let createdCollectionId = '12345';

    const title = 'Test model';
    const scale = '1:64';
    const condition = 'Mint';
    const packaging = 'Card';
    const status = 'For sale';

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
            .then(() => {
                return Users.hashPassword(password).then(password =>
                    Collections.create({
                        userId: createdUserId,
                        name: 'test collection',
                    })
                        .then(collection => {
                            createdCollectionId = collection.id;
                        })
                );
            })
    });

    after(function () {
        return Users.deleteMany({})
            .then(Collections.deleteMany({}))
            .then(() => closeServer())
    });

    describe('/api/models', function () {
        it(`Should post a model`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .post('/api/models')
                        .set('authorization', `Bearer ${token}`)
                        .send({
                            userId: createdUserId,
                            collectionId: createdCollectionId,
                            title,
                            scale,
                            condition,
                            packaging,
                            status
                        })
                        .then(res => {
                            createdModelId = res.body._id;
                            expect(res).to.have.status(201);
                            expect(res.body).to.be.an('object');
                            expect(res.body.userId).to.deep.equal(createdUserId);
                            expect(res.body.title).to.deep.equal(title);
                            expect(res.body.scale).to.deep.equal(scale);
                            expect(res.body.condition).to.deep.equal(condition);
                            expect(res.body.packaging).to.deep.equal(packaging);
                            expect(res.body.status).to.deep.equal(status);
                        });
                })
        });
        it(`Should prevent unauthorized user from posting a model`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .post('/api/models')
                        .set('authorization', `Bearer ${token}`)
                        .send({
                            userId: '12345',
                            title,
                            scale,
                            condition,
                            packaging,
                            status
                        })
                        .then(res => {
                            expect(res).to.have.status(403);
                        });
                })
        });
        it(`Should return a user's model`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/models/${createdModelId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.title).to.deep.equal(title);
                            expect(res.body.scale).to.deep.equal(scale);
                        });
                })
        });
        it(`Should prevent unauthorized user from getting a user's model`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/models/${createdModelId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(401);
                        });
                })
        });
        it(`Should return all models in a collection`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/models/collection/${createdCollectionId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('array');
                        });
                })
        });
        it(`Should prevent unauthorized user from getting all models in a collection`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/models/collection/${createdCollectionId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(401);
                        });
                })
        });
        it(`Should return all user's models`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get('/api/models')
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('array');
                        });
                })
        });
        it(`Should prevent unauthorized user from getting all user's models`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return chai
                        .request(app)
                        .get('/api/models')
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(401);
                        });
                })
        });
        it(`Should update model`, function () {
            const updateData = {
                _id: createdModelId,
                title: 'foo',
                scale,
                condition,
                packaging,
                status

            };
            return login(email, password)
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .put(`/api/models/${createdModelId}`)
                            .set('authorization', `Bearer ${token}`)
                            .send(updateData)
                            .then((res) => {
                                expect(res).to.have.status(200);
                                expect(res.body).to.be.a("object");
                                expect(res.body.title).to.deep.equal(updateData.title);
                            })
                    );
                })
        });
        it(`Should prevent unauthorized user from updating model`, function () {
            const updateData = {
                _id: createdModelId,
                title: 'foo',
            };
            return login(email, 'wrongPassword')
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .put(`/api/models/${createdModelId}`)
                            .set('authorization', `Bearer ${token}`)
                            .send(updateData)
                            .then((res) => {
                                expect(res).to.have.status(401);
                            })
                    );
                })
        });
        it(`Should delete model`, function () {
            return login(email, password)
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .delete(`/api/models/${createdModelId}`)
                            .set('authorization', `Bearer ${token}`)
                            .then(function (res) {
                                expect(res).to.have.status(204);
                            })
                    );
                })
        });
        it(`Should prevent unauthorized user from deleting model`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .delete(`/api/models/${createdModelId}`)
                            .set('authorization', `Bearer ${token}`)
                            .then(function (res) {
                                expect(res).to.have.status(401);
                            })
                    );
                })
        });
    });
});