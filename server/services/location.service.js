const { Location } = require('../mongo');
const ReadPreference = require('mongodb').ReadPreference;
const logger = require('../config/winston');

require('../mongo');

function get(req, res) {
  const docquery = Location.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then((locations) => {
      res.json(locations);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

async function getById(req, res) {
  const { _id, title, description } = req.body;
  const docquery = Location.findOne({ _id: req.params._id });
  docquery
    .exec()
    .then((locations) => {
      if (!locations) {
        logger.error(`Error - API - clocationService - getById - Couldn't find location ${req.params._id}`);
        res.status(500).send({ error: 'Location not found' });
      } else {
        res.json(locations);
      }
    })
    .catch((err) => {
      logger.error(`Error - API - locationService - getById - ${err}`);
      res.status(500).send(err);
    });
}

function create(req, res) {
  const docquery = new Location(req.body);
  docquery
    .save()
    .then((location) => {
      res.json(location);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

function update(req, res) {
  Location.findByIdAndUpdate(
    req.params._id,
    {
      name: req.body.name,
      parent: req.body.parent
    },
    function (err, result) {
      if (err) {
        logger.error(`Debug - API - Error: ${err}`);
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
}

function remove(req, res) {
  logger.info(`Debug - API - remove location: ${req.params._id}`);
  Location.findOneAndRemove({ _id: req.params._id })
    .then((location) => {
      res.json(location);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

module.exports = { get, getById, create, update, remove };
