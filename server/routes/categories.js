var express = require('express');
var router = express.Router();
const logger = require('../config/winston');

const categoryService = require('../services/category.service');

const auth = require('../middlewares/auth');

router.get('/', (req, res, next) => {
  try {
    categoryService.get(req, res);
  } catch (err) {
    logger.error(`Error - API - get /users/${req.body} - ${err}`);
    next(err);
  }
});

router.get('/:_id', (req, res, next) => {
  try {
    categoryService.getById(req, res);
  } catch (err) {
    logger.error(`Error - API - get by id /categories/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/update/:_id', (req, res) => {
  try {
    categoryService.update(req, res);
  } catch (err) {
    logger.error(`Error - API - update /categories/update/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/:_id', auth, (req, res, next) => {
  try {
    categoryService.create(req, res);
  } catch (err) {
    logger.error(`Error - API - create /categories/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/', auth, (req, res, next) => {
  try {
    categoryService.create(req, res);
  } catch (err) {
    logger.error(`Error - API - create /categories ${res.locals._id} - ${err}`);
    next(err);
  }
});

router.delete('/:_id', auth, (req, res, next) => {
  try {
    categoryService.remove(req, res);
  } catch (err) {
    logger.error(`Error - API - delete /categories/${req.body._id} - ${err}`);
    next(err);
  }
});

module.exports = router;
