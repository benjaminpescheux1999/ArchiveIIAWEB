var express = require('express');
var router = express.Router();
const path = require('path');
const logger = require('../config/winston');

const fs = require('fs');

const offerService = require('../services/offer.service');

const auth = require('../middlewares/auth');

const {
  removeLocalFileFromAzure,
  uploadLocalFileToAzure,
  blobService,
  CONTAINER_NAME
} = require('../services/azureStorage');
const upload = require('../config/multer.js');

router.get('/', (req, res) => {
  try {
    offerService.get(req, res);
  } catch (err) {
    logger.error(`Error - API - get /offers - ${err}`);
    next(err);
  }
});

router.get('/All', (req, res) => {
  try {
    offerService.getBack(req, res);
  } catch (err) {
    logger.error(`Error - API - get /offers - ${err}`);
    next(err);
  }
});

router.get('/:_id', (req, res, next) => {
  try {
    offerService.getById(req, res);
  } catch (err) {
    logger.error(`Error - API - get /offers/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/update/:_id', auth, (req, res) => {
  try {
    offerService.update(req, res);
  } catch (err) {
    logger.error(`Error - API - post /offers/update/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/search', (req, res, next) => {
  try {
    offerService.search(req, res);
  } catch (err) {
    logger.error(`Error - API - search /offers/search - ${err}`);
    next(err);
  }
});

router.post('/searchAll', (req, res, next) => {
  try {
    offerService.searchBack(req, res);
  } catch (err) {
    logger.error(`Error - API - search /offers/search - ${err}`);
    next(err);
  }
});

router.post('/:_id', auth, (req, res, next) => {
  try {
    offerService.create(req, res);
  } catch (err) {
    logger.error(`Error - API - create /offers/${req.body._id} - ${err}`);
    next(err);
  }
});

router.post('/', auth, (req, res, next) => {
  try {
    offerService.create(req, res);
  } catch (err) {
    logger.error(`Error - API - create /offers/${res.locals._id} - ${err}`);
    next(err);
  }
});

router.delete('/:_id', auth, (req, res, next) => {
  logger.info(`passage delete${req.body}`);
  try {
    offerService.remove(req, res);
  } catch (err) {
    logger.error(`Error - API - create /offers/${req.body._id} - ${err}`);
    next(err);
  }
});

router.put('/validate/:_id', auth, (req, res, next) => {
  try {
    offerService.validate(req, res);
  } catch (err) {
    logger.error(`Error - API - create /offers/${req.body._id} - ${err}`);
    next(err);
  }
});

router.put('/pending/:_id', auth, (req, res, next) => {
  try {
    offerService.pending(req, res);
  } catch (err) {
    logger.error(`Error - API - create /offers/${req.body._id} - ${err}`);
    next(err);
  }
});

// Get offer picture
router.get('/picture/:id/', (req, res) => {
  const filepath = `${path.resolve(`${__dirname}/../pictures/`)}/${
    req.params.id
  }.jpg`;
  if (fs.existsSync(filepath)) {
    // BACKWARDS COMPATIBILITY: try to serve from local copy first
    return res.download(filepath);
  }
  const blobName = `pictures/${path.basename(filepath)}`;
  const url = blobService.getUrl(CONTAINER_NAME, blobName);
  // append ts
  const qi = req.originalUrl.indexOf('?');
  const qs = qi >= 0 ? req.originalUrl.slice(qi + 1) : '';
  return res.redirect(`${url}?${qs}`);
});

// Upload offer picture
router.post(
  '/picture/:id',
  auth,
  upload.single('file'),
  async (req, res, next) => {
    const filepath = `${path.resolve(`${__dirname}/../pictures/`)}/${
      req.params.id
    }.jpg`;
    try {
      const url = await uploadLocalFileToAzure('pictures', filepath);
      // wait a bit to be sure that image is accessible on the bucket
      await new Promise((resolve) => setTimeout(resolve, 200));
      fs.unlink(filepath, () => {}); // remove the local file
      logger.info(`uploadProductPicture - Successful, id: ${req.params.id}`);
      return res.json({
        success: true,
        msg: `Picture was successfully uploaded for offer ${req.params.id}`,
        url
      });
    } catch (err) {
      logger.error(`Upload offer picture failed: ${err.message}`);
      return next(err);
    }
  }
);

// Delete offer picture
router.delete('/picture/:id', auth, async (req, res, next) => {
  const filepath = `${path.resolve(`${__dirname}/../../pictures/`)}/${
    req.params.id
  }.jpg`;
  try {
    await removeLocalFileFromAzure('pictures', filepath);
  } catch (err) {
    logger.error(`Delete offer picture failed: ${err.message}`);
    return next(err);
  }
  logger.info(`deleteProductPicture - Successful, id: ${req.params.id}`);
  return res.json({
    success: true,
    msg: `Picture was successfully deleted for offer ${req.params.id}`
  });
});

module.exports = router;
