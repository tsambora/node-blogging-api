const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

const should = chai.should(); // eslint-disable-line no-unused-vars
const knex = require('knex')(require('../knexfile'));

chai.use(chaiHttp);

describe('Users', () => {
  before(async () => {
    await knex.schema.createTable('user', (t) => {
      t.increments('id').primary();
      t.string('username').notNullable();
      t.string('salt').notNullable();
      t.string('encrypted_password').notNullable();
      t.timestamps(false, true);
    });

    await knex('user').insert({
      salt: 'dummysalt',
      encrypted_password: '7c6f1255f5ff09c66553d8fdcb7e261a8f62db123b97c5a9067beb1a9b320a8656bc1f46ef7d433fa22ffb0e06e189dc1fd5dc8095c888daf0436266f4de80ba',
      username: 'dummyname',
    });
  });

  after(async () => {
    await knex.schema.dropTableIfExists('user');
  });

  describe('registration', () => {
    it('it should return token if successful', (done) => {
      chai.request(server)
        .post('/register')
        .send({
          username: 'testname',
          password: 'testpw',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token').be.a('string');
          done();
        });
    });

    it('it should return 400 if existing username entered', (done) => {
      chai.request(server)
        .post('/register')
        .send({
          username: 'dummyname',
          password: 'dummypw',
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('login', () => {
    it('it should return token if successful', (done) => {
      chai.request(server)
        .post('/login')
        .send({
          username: 'dummyname',
          password: 'dummypw',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token').be.a('string');
          done();
        });
    });

    it('it should return 401 if username doesn\'t exists', (done) => {
      chai.request(server)
        .post('/login')
        .send({
          username: 'nonexistentdummyname',
          password: 'dummypw',
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should return 401 if wrong pw entered', (done) => {
      chai.request(server)
        .post('/login')
        .send({
          username: 'dummyname',
          password: 'dummywrongpw',
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('getting user data', () => {
    it('it should return user id and username if token is valid', (done) => {
      chai.request(server)
        .post('/login')
        .send({
          username: 'dummyname',
          password: 'dummypw',
        })
        .end((loginErr, loginRes) => {
          const { token } = loginRes.body;
          chai.request(server)
            .get('/me')
            .set('x-access-token', token)
            .end((getErr, getRes) => {
              getRes.should.have.status(200);
              getRes.body.should.be.a('object');
              getRes.body.should.have.property('id').be.a('number');
              getRes.body.should.have.property('username').be.a('string');
              done();
            });
        });
    });
  });
});
