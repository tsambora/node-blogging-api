const express = require('express');
const bodyParser = require('body-parser');

const utils = require('./utils');
const store = require('./store');

const app = express();
app.use(bodyParser.json());
app.post('/register', (req, res) => {
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
app.post('/login', (req, res) => {
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
app.get('/me', utils.verifyToken, (req, res) => {
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

/* eslint-disable no-console */
app.listen(7555, () => {
  console.log('Server running on http://localhost:7555');
});
/* eslint-disable no-console */
