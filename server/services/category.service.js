const { Category } = require('../mongo');
const ReadPreference = require('mongodb').ReadPreference;
const logger = require('../config/winston');

require('../mongo');

function get(req, res) {
  const docquery = Category.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then((categories) => {
      res.json(categories);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

async function getById(req, res) {
  const { _id, title, description } = req.body;
  const docquery = Category.findOne({ _id: req.params._id });
  docquery
    .exec()
    .then((categories) => {
      if (!categories) {
        logger.error(`Error - API - categoryService - getById - Couldn't find category ${req.params._id}`);
        res.status(500).send({ error: 'Category not found' });
      } else {
        res.json(categories);
      }
    })
    .catch((err) => {
      logger.error(`Error - API - categoryService - getById - ${err}`);
      res.status(500).send(err);
    });
}

function create(req, res) {
  const docquery = new Category(req.body);
  docquery
    .save()
    .then((category) => {
      res.json(category);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

function update(req, res) {
  Category.findByIdAndUpdate(
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
  Category.findOneAndRemove({ _id: req.params._id })
    .then((category) => {
      res.json(category);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

module.exports = { get, getById, create, update, remove };
