const jwt = require('jsonwebtoken');
const config = require('./config');

/* eslint-disable consistent-return */
function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send({ success: false, data: { message: 'No token provided.' } });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({ success: false, data: { message: 'Failed to authenticate token.' } });
    }

    req.userId = decoded.id;
    next();
  });
}
/* eslint-disable consistent-return */

module.exports = {
  verifyToken,
};
