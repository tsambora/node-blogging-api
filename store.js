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
    const existingUser = await knex('user').where({ username });

    if (!existingUser.length) {
      const newUser = await knex('user').insert({
        salt,
        encrypted_password: hash,
        username,
      });

      if (newUser.length) {
        return { success: true };
      }
    }
    return { success: false };
  },
  authenticate({ username, password }) {
    console.log(`Authenticating user ${username}`);
    return knex('user').where({ username })
      .then(([user]) => {
        if (!user) {
          return { success: false };
        }
        const { hash } = saltHashPassword({
          password,
          salt: user.salt,
        });
        return { success: hash === user.encrypted_password };
      });
  },
};
