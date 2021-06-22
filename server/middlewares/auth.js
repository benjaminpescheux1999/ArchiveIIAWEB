let jwt = require('jsonwebtoken');
const logger = require('../config/winston');

module.exports = (req, res, next) => {
  const temp = 'temp'; //TODO: set 'temp' as a environment variable + rename variable to a more meaningful name (e.g. SECRET)

  try {
    const bearer = req.headers.authorization.split(' ');
    const token = bearer[1];
    jwt.verify(token, temp, (err, decoded) => {
      if (err) {
        logger.error(`Error - API - Auth token verify - ${err}`);
        if ((err = 'TokenExpiredError: jwt expired')) {
          logger.error(`token expiré`);
          res.status(401).json({ error: err });
        } else {
          logger.error(`token ok`);
        }
      }
      if (!decoded || !decoded.username) {
        res.status(403).json({ error: 'Invalid token' });
      } else {
        res.locals._id = decoded._id;
        next();
      }
    });
  } catch (cerr) {
    logger.error(`Error - API - Auth error - ${cerr}`);
    res.status(401).json({ error: 'Invalid request' });
  }
};
