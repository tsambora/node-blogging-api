const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');

const should = chai.should(); // eslint-disable-line no-unused-vars
const knex = require('knex')(require('../knexfile'));

chai.use(chaiHttp);

describe('Users', () => {
  describe('registration', () => {
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
        encrypted_password: 'dummypw',
        username: 'dummyname',
      });
    });

    after(async () => {
      await knex.schema.dropTableIfExists('user');
    });

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

    it('it should return unsuccessful message if existing username entered', (done) => {
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
});
