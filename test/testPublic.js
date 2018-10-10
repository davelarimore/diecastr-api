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
describe('Public endpoints', function () {
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
                return Collections.create({
                    userId: createdUserId,
                    name: 'test collection',
                    public: true,
                })
                    .then(collection => {
                        createdCollectionId = collection.id;
                    })
            })
            .then(() => {
                return Models.create({
                    userId: createdUserId,
                    collectionId: createdCollectionId,
                    title,
                    scale,
                    condition,
                    packaging,
                    status
                })
                    .then(model => {
                        createdModelId = model.id;
                    })
            })
    });

    after(function () {
        return Users.deleteMany({})
            .then(Collections.deleteMany({}))
            .then(Models.deleteMany({}))
            .then(() => closeServer())
    });

    describe('/public/models', function () {
        it(`Should return all models in a public collection`, function () {
            return chai
                .request(app)
                .get(`/public/models/collection/${createdCollectionId}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                });
        });
        it(`Should return all public collections`, function () {
            return chai
                .request(app)
                .get('/public/collections')
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                });
        });
    });
});