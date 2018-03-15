const express = require('express');
const bodyParser = require('body-parser');

const utils = require('./utils');
const store = require('./store');

const app = express();
app.use(bodyParser.json());
app.get('/api', (req, res) => {
  res.status(200).send({ message: 'API is running' });
});
app.post('/api/register', (req, res) => {
  store
    .createUser({
      username: req.body.username,
      password: req.body.password,
    })
    .then(({ success, data }) => {
      if (success) {
        res.status(200).send(data);
      } else {
        res.sendStatus(400);
      }
    });
});
app.post('/api/login', (req, res) => {
  store
    .loginUser({
      username: req.body.username,
      password: req.body.password,
    })
    .then(({ success, data }) => {
      if (success) {
        res.status(200).send(data);
      } else {
        res.sendStatus(401);
      }
    });
});
app.get('/api/me', utils.verifyToken, (req, res) => {
  store
    .getUser({
      userId: req.userId,
    })
    .then(({ success, data }) => {
      if (success) {
        res.status(200).send(data);
      } else {
        res.sendStatus(400);
      }
    });
});

app.listen(7555, () => {
  console.log('Server running on http://localhost:7555'); // eslint-disable-line no-console
});

module.exports = app;
