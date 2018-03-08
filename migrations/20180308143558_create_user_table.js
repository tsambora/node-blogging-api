
exports.up = knex => knex.schema.createTable('user', (t) => {
  t.increments('id').primary();
  t.string('username').notNullable();
  t.string('password').notNullable();
  t.timestamps(false, true);
});

exports.down = knex => knex.schema.dropTableIfExists('user');
