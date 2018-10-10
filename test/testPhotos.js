'use strict';
const { TEST_DATABASE_URL } = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const Users = require('../models/usersModel');
const Models = require('../models/modelsModel');
const Photos = require('../models/photosModel');

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
describe('Protected photos endpoint', function () {
    const email = 'example@test.biz';
    const password = 'examplePass';
    const userName = 'Example';
    let createdUserId = '';
    let createdModelId = '';
    let createdPhotoId = '';

    const title = 'Test model';
    const scale = '1:64';
    const condition = 'Mint';
    const packaging = 'Card';
    const status = 'For sale';

    const url = 'http://test';
    const description = 'my photo';

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
                    Models.create({
                        title,
                        scale,
                        condition,
                        packaging,
                        status
                    })
                        .then(model => {
                            createdModelId = model.id;
                        })
                );
            })
    });

    after(function () {
        return Users.deleteMany({})
            .then(Models.deleteMany({}))
            .then(() => closeServer())
    });

    describe('/api/photos', function () {
        it(`Should post a photo`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .post('/api/photos')
                        .set('authorization', `Bearer ${token}`)
                        .send({
                            userId: createdUserId,
                            modelId: createdModelId,
                            url,
                            description,
                        })
                        .then(res => {
                            createdPhotoId = res.body._id;
                            expect(res).to.have.status(201);
                            expect(res.body).to.be.an('object');
                            expect(res.body.modelId).to.deep.equal(createdModelId);
                            expect(res.body.url).to.deep.equal(url);
                            expect(res.body.description).to.deep.equal(description);
                        });
                })
        });
        it(`Should prevent unauthorized user from posting a photo`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .post('/api/photos')
                        .set('authorization', `Bearer ${token}`)
                        .send({
                            userId: '12345',
                            modelId: createdModelId,
                            url,
                            description,
                        })
                        .then(res => {
                            expect(res).to.have.status(403);
                        });
                })
        });
        it(`Should return a user's photo`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/photos/${createdPhotoId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.modelId).to.deep.equal(createdModelId);
                            expect(res.body.url).to.deep.equal(url);
                            expect(res.body.description).to.deep.equal(description);
                        });
                })
        });
        it(`Should prevent unauthorized user from getting a user's photo`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return chai
                        .request(app)
                        .get(`/api/photos/${createdPhotoId}`)
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(401);
                        });
                })
        });
        it(`Should return all user's photos`, function () {
            return login(email, password)
                .then((token) => {
                    return chai
                        .request(app)
                        .get('/api/photos')
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('array');
                        });
                })
        });
        it(`Should prevent unauthorized user from getting all user's photos`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return chai
                        .request(app)
                        .get('/api/photos')
                        .set('authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(401);
                        });
                })
        });
        it(`Should update photo`, function () {
            const updateData = {
                _id: createdPhotoId,
                url: 'test',
                description,
            };
            return login(email, password)
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .put(`/api/photos/${createdPhotoId}`)
                            .set('authorization', `Bearer ${token}`)
                            .send(updateData)
                            .then((res) => {
                                expect(res).to.have.status(200);
                                expect(res.body).to.be.a("object");
                                expect(res.body.url).to.deep.equal(updateData.url);
                            })
                    );
                })
        });
        it(`Should prevent unauthorized user from updating photo`, function () {
            const updateData = {
                _id: createdPhotoId,
                url: 'test',
                description,
            };
            return login(email, 'wrongPassword')
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .put(`/api/photos/${createdPhotoId}`)
                            .set('authorization', `Bearer ${token}`)
                            .send(updateData)
                            .then((res) => {
                                expect(res).to.have.status(401);
                            })
                    );
                })
        });
        it(`Should delete photo`, function () {
            return login(email, password)
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .delete(`/api/photos/${createdPhotoId}`)
                            .set('authorization', `Bearer ${token}`)
                            .then(function (res) {
                                expect(res).to.have.status(204);
                            })
                    );
                })
        });
        it(`Should prevent unauthorized user from deleting photo`, function () {
            return login(email, 'wrongPassword')
                .then((token) => {
                    return (
                        chai
                            .request(app)
                            .delete(`/api/photos/${createdPhotoId}`)
                            .set('authorization', `Bearer ${token}`)
                            .then(function (res) {
                                expect(res).to.have.status(401);
                            })
                    );
                })
        });
    });
});