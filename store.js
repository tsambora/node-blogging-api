const crypto = require('crypto');
const knex = require('knex')(require('./knexfile'));
const jwt = require('jsonwebtoken');

const config = require('./config');

function randomString() {
  return crypto.randomBytes(4).toString('hex');
}

function saltHashPassword({
  password,
  salt = randomString(),
}) {
  const hash = crypto
    .createHmac('sha512', salt)
    .update(password);
  return {
    salt,
    hash: hash.digest('hex'),
  };
}

module.exports = {
  saltHashPassword,
  async createUser({ username, password }) {
    console.log(`Add user ${username}`);
    const existingUsers = await knex('user').where({ username });
    if (!existingUsers.length) {
      const { salt, hash } = saltHashPassword({ password });
      const rows = await knex('user').insert({
        salt,
        encrypted_password: hash,
        username,
      });
      if (rows.length) {
        const userId = rows[0];
        const token = jwt.sign({ id: userId }, config.secret, {
          expiresIn: 30,
        });
        return { success: true, data: { token } };
      }
    }
    return { success: false, data: null };
  },
  async loginUser({ username, password }) {
    console.log(`Log in user ${username}`);
    const rows = await knex('user').where({ username });
    if (!rows.length) {
      return { success: false };
    }
    const user = rows[0];
    const { hash } = saltHashPassword({
      password,
      salt: user.salt,
    });
    if (hash === user.encrypted_password) {
      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 30,
      });
      return { success: true, data: { token } };
    }
    return { success: false, data: null };
  },
  async getUser({ userId }) {
    console.log(`Get user ${userId}`);
    const rows = await knex('user').where({ id: userId });
    if (!rows.length) {
      return { success: false, data: null };
    }
    const { id, username } = rows[0];
    return { success: true, data: { id, username } };
  },
};
