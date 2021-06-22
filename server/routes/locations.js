var express = require('express');
var router = express.Router();
const logger = require('../config/winston');

const locationService = require('../services/location.service');

const auth = require('../middlewares/auth');

router.get('/', (req, res, next) => {
  try {
    locationService.get(req, res);
  } catch (err) {
    logger.error(`Error - API - get /users/${req.body} - ${err}`);
    next(err);
  }
});

router.get('/:_id', (req, res, next) => {
  try {
    locationService.getById(req, res);
  } catch (err) {
    logger.error(`Error - API - get by id /locations/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/update/:_id', (req, res) => {
  try {
    locationService.update(req, res);
  } catch (err) {
    logger.error(`Error - API - update /locations/update/${req.body._id} - ${err}`);
    next(err);
  }
});

// router.post('/:_id', auth, (req, res, next) => {
//   try {
//     locationService.create(req, res);
//   } catch (err) {
//     logger.error(`Error - API - create /locations/${req.body._id} - ${err}`);
//     next(err);
//   }
// });

router.post('/', auth, (req, res, next) => {
  try {
    locationService.create(req, res);
  } catch (err) {
    logger.error(`Error - API - create /locations ${res.locals._id} - ${err}`);
    next(err);
  }
});

router.delete('/:_id', auth, (req, res, next) => {
  try {
    locationService.remove(req, res);
  } catch (err) {
    logger.error(`Error - API - delete /locations/${req.body._id} - ${err}`);
    next(err);
  }
});

module.exports = router;
