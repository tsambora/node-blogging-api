const crypto = require('crypto');
const knex = require('knex')(require('./knexfile'));

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
    const { salt, hash } = saltHashPassword({ password });
    const rows = await knex('user').where({ username });
    if (!rows.length) {
      // TODO: find a way to name this "user" var correctly
      const user = await knex('user').insert({
        salt,
        encrypted_password: hash,
        username,
      });
      if (user.length) {
        return { success: true };
      }
    }
    return { success: false };
  },
  async authenticate({ username, password }) {
    console.log(`Authenticating user ${username}`);
    const rows = await knex('user').where({ username });
    if (!rows.length) {
      return { success: false };
    }
    const user = rows[0];
    const { hash } = saltHashPassword({
      password,
      salt: user.salt,
    });
    return { success: hash === user.encrypted_password };
  },
};
