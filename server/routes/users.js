var express = require('express');
var router = express.Router();
const logger = require('../config/winston');

const userService = require('../services/user.service');
const auth = require('../middlewares/auth');
// TODO: Auth on users management

router.get('/', (req, res) => {
  try {
    userService.get(req, res);
  } catch (err) {
    logger.error(`Error - API - get /users - ${err}`);
    next(err);
  }
});

router.get('/:_id', (req, res, next) => {
  try {
    userService.getById(req, res);
  } catch (err) {
    logger.error(`Error - API - get /users/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/update/:_id', auth, (req, res) => {
  try {
    userService.update(req, res);
  } catch (err) {
    logger.error(`Error - API - post /users/update/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/log_in', (req, res) => {
  try {
    userService.login(req, res);
  } catch (err) {
    logger.error(`Error - API - post /users/log_in - ${err}`);
    next(err);
  }
});
router.post('/log_in/admin', (req, res) => {
  try {
    userService.loginAdmin(req, res);
  } catch (err) {
    logger.error(`Error - API - post /users/log_in - ${err}`);
    next(err);
  }
});

router.post('/sign_up', (req, res) => {
  try {
    userService.create(req, res);
  } catch (err) {
    logger.error(`Error - API - post /users/sign_up - ${err}`);
    next(err);
  }
});

router.post('/send_email', auth, (req, res, next) => {
  logger.info(`All data${JSON.stringify(req.body)}`);
  try {
    userService.sendMail(req, res);
  } catch (err) {
    logger.error(`Error - API - send_mail /users/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/:_id', (req, res, next) => {
  try {
    userService.create(req, res);
  } catch (err) {
    logger.error(`Error - API - create /users/${req.body._id} - ${err}`);
    next(err);
  }
});

router.delete('/:_id', auth, (req, res, next) => {
  try {
    userService.remove(req, res);
  } catch (err) {
    logger.error(`Error - API - create /users/${req.body._id} - ${err}`);
    next(err);
  }
});

module.exports = router;
