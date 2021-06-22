const { Offer } = require('../mongo');
const { User } = require('../mongo');
const { Category } = require('../mongo');
const logger = require('../config/winston');

const ReadPreference = require('mongodb').ReadPreference;
const { v4: uuidv4 } = require('uuid');
const sendgrid = require('@sendgrid/mail');

const userService = require('./user.service');
const { log } = require('debug');
const SENDGRID_KEY =
  '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';
require('../mongo');
sendgrid.setApiKey(SENDGRID_KEY);

function get(req, res) {
  const count = Offer.find({}).read(ReadPreference.NEAREST);
  const docquery = Offer.find({ state: 'enable', CGU: true })
    .limit(25)
    // .sort('-createdAt') // FIXME: doesn't work
    .read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then((offers) => {
      count.then((count) => {
        counter = count.length;
        offers = offers.reverse(); // NOTE: reverse default array ordered by createdAt ASC
        res.json({ offers, count: counter, loader: 'false' });
      });
    })
    .catch((err) => {
      logger.error(`Error - API - offerService - search - ${err}`);
      res.status(500).send(err);
    });
}

function getBack(req, res) {
  const count = Offer.find({}).read(ReadPreference.NEAREST);
  const docquery = Offer.find({}).limit(25).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then((offers) => {
      count.then((count) => {
        counter = count.length;
        offers.reverse();
        res.json({ offers, count: counter, loader: 'false' });
      });
    })
    .catch((err) => {
      logger.error(`Error - API - offerService - search - ${err}`);
      res.status(500).send(err);
    });
}

function search(req, res) {
  console.log('information search', req.body.search);
  let filter = {};
  let tmp_query = {};
  let tmp_sort = {};
  tmp_sort['sort'] = { _id: -1 };

  let price1 = { $gte: 0, $lte: 999999999999 };

  // fix bug location null
  if (req.body.search.locations == null || undefined) {
    req.body.search.locations = '';
  }

  // Gestion prix
  // prix min et max
  if (
    req.body.search.priceMin.length != 0 &&
    req.body.search.priceMax.length != 0
  ) {
    price1 = {
      $gte: Number.parseInt(req.body.search.priceMin, 10),
      $lte: Number.parseInt(req.body.search.priceMax, 10)
    };
  }
  // prix min
  if (
    req.body.search.priceMin.length != 0 &&
    req.body.search.priceMax.length == 0
  ) {
    price1 = { $gte: Number.parseInt(req.body.search.priceMin, 10) };
  }
  // prix max
  if (
    req.body.search.priceMin.length == 0 &&
    req.body.search.priceMax.length != 0
  ) {
    price1 = { $lte: Number.parseInt(req.body.search.priceMax, 10) };
  }

  console.log('taille de min', req.body.search.priceMin.length);
  console.log('taille de max', req.body.search.priceMax.length);
  // gestion tri
  switch (req.body.search.sort) {
    case 'price-asc':
      tmp_sort['sort'] = { price: -1 };
      break;
    case 'price-desc':
      tmp_sort['sort'] = { price: 1 };
      break;
    default:
      tmp_sort['sort'] = {};
  }
  logger.info('tri ==>', tmp_sort['sort']);

  // var filter
  filter = {
    $or: [
      { title: new RegExp(req.body.search.title, 'i') },
      { description: new RegExp(req.body.search.title, 'i') },
      { categories: new RegExp(req.body.search.title, 'i') },
      { locations: new RegExp(req.body.search.title, 'i') }
    ],
    $and: [
      { state: 'enable' },
      { CGU: true },
      // { categories: { $all: ["Video games", "Long term rental"] } },
      // { categories: new RegExp("Long term rental") },
      { categories: new RegExp(req.body.search.categories) },
      { locations: new RegExp(req.body.search.locations) },
      { price: price1 }
    ],
    ...tmp_query
  };

  // function counter
  const count = Offer.find(filter);

  // Filter
  const docquery = Offer.find(filter)
    .limit(req.body.search.limit)
    .skip(req.body.search.skip)
    .sort(tmp_sort['sort'])
    .read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then((offers) => {
      count.then((count) => {
        counter = count.length;
        req.body.search.sort === ('date-asc' || 'price-asc' || 'price-desc')
          ? offers
          : offers.reverse();
        res.json({ offers, count: counter, loader: 'false' });
      });
    })
    .catch((err) => {
      logger.error(`Error - API - offerService - search - ${err}`);
      res.status(500).send(err);
    });
}

async function getById(req, res) {
  const { _id, title, description } = req.body;
  const docquery = Offer.findOne({ _id: req.params._id });
  docquery
    .exec()
    .then((offers) => {
      if (offers.creator) {
        logger.info(`Debug - API - offerService - before creator check`);
        userService
          .getByIdExtern(offers.creator)
          .then((user) => {
            res.json({
              title: offers.title,
              description: offers.description,
              price: offers.price,
              currency: offers.currency,
              city: offers.city,
              categories: offers.categories,
              locations: offers.locations,
              creator: { username: user.username, phone: user.phone },
              pictures: offers.pictures
            });
          })
          .catch((err) => {
            logger.error(`Error - API - offerService - user check: ${err}`);
          });
      } else {
        res.json(offers);
      }
    })
    .catch((err) => {
      logger.error(`Error - API - offerService - getById - ${err}`);
      res.status(500).send(err);
    });
}

function searchBack(req, res) {
  let filter = {};
  let tmp_query = {};
  let tmp_sort = {};
  let price1 = { $gte: 0, $lte: 999999999999 };
  // fix bug location null
  if (req.body.search.locations === null) {
    req.body.search.locations = '';
  }

  // Gestion prix
  if (req.body.search.priceMin && req.body.search.priceMin) {
    price1 = {
      $gte: Number.parseInt(req.body.search.priceMin, 10),
      $lte: Number.parseInt(req.body.search.priceMax, 10)
    };
  }
  if (req.body.search.priceMin && !req.body.search.priceMax) {
    price1 = { $gte: Number.parseInt(req.body.search.priceMin, 10) };
  }
  if (!req.body.search.priceMin && req.body.search.priceMax) {
    price1 = { $lte: Number.parseInt(req.body.search.priceMax, 10) };
  }

  // gestion tri
  switch (req.body.search.sort) {
    case 'price-asc':
      tmp_sort['sort'] = { price: 1 };
      break;
    case 'price-desc':
      tmp_sort['sort'] = { price: -1 };
      break;
    case 'date-asc':
      tmp_sort['sort'] = { createdAt: -1 };
      break;
    case 'date-desc':
      tmp_sort['sort'] = { createdAt: 1 };
  }
  // var filter
  filter = {
    $or: [
      { title: new RegExp(req.body.search.title, 'i') },
      { description: new RegExp(req.body.search.title, 'i') },
      { categories: new RegExp(req.body.search.title, 'i') },
      { locations: new RegExp(req.body.search.title, 'i') }
    ],
    $and: [
      { categories: new RegExp(req.body.search.categories) },
      { locations: new RegExp(req.body.search.locations) },
      { price: price1 }
    ],
    ...tmp_query
  };

  // function counter
  const count = Offer.find(filter);

  // Filter
  const docquery = Offer.find(filter)
    .limit(req.body.search.limit)
    .skip(req.body.search.skip)
    .sort(tmp_sort['sort'])
    .read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then((offers) => {
      count.then((count) => {
        counter = count.length;
        res.json({ offers, count: counter, loader: 'false' });
      });
    })
    .catch((err) => {
      logger.error(`Error - API - offerService - search - ${err}`);
      res.status(500).send(err);
    });
}

async function getById(req, res) {
  const { _id, title, description } = req.body;
  const docquery = Offer.findOne({ _id: req.params._id });
  docquery
    .exec()
    .then((offers) => {
      if (offers.creator) {
        logger.info(`Debug - API - offerService - before creator check`);
        userService
          .getByIdExtern(offers.creator)
          .then((user) => {
            res.json({
              title: offers.title,
              description: offers.description,
              price: offers.price,
              currency: offers.currency,
              city: offers.city,
              categories: offers.categories,
              locations: offers.locations,
              creator: { username: user.username, phone: user.phone },
              pictures: offers.pictures
            });
          })
          .catch((err) => {
            logger.error(`Error - API - offerService - user check: ${err}`);
          });
      } else {
        res.json(offers);
      }
    })
    .catch((err) => {
      logger.error(`Error - API - offerService - getById - ${err}`);
      res.status(500).send(err);
    });
}

function create(req, res) {
  logger.info('categorie', req.body.categories);
  let Tabcat = [];
  const Categorie = Category.find({ name: req.body.categories });
  Categorie.exec()
    .then((categories) => {
      if (!categories) {
        logger.error(
          `Error - API - categorieService - getById - Couldn't find categorie ${req.params._id}`
        );
        res.status(500).send({ error: 'categorie not found' });
      } else {
        logger.info('categorie trouvé', categories);
        logger.info('parent ===>', categories[0].parent);

        if (categories[0].parent === null) {
          logger.info('ajouter uniquement La categorie parent');

          Tabcat.push(categories[0].name);
          // logger.info("Tableau Categorie", Tabcat);
        } else {
          logger.info('ajouter parent + enfant');

          const CatEnfant = Category.find({ _id: categories[0].parent });

          CatEnfant.exec()
            .then((Enfantcategories) => {
              if (!Enfantcategories) {
                logger.error(
                  `Error - API - categoryService - getById - Couldn't find category ${req.params._id}`
                );
                res.status(500).send({ error: 'Category not found' });
              } else {
                logger.info('Enfantcategories', Enfantcategories);
                Tabcat.push(categories[0].name);
                Tabcat.push(Enfantcategories[0].name);
                let offer = null;
                let newoffer = {};

                const docquery = User.findOne({ username: req.body.creator });
                if (req.body.creator) {
                  logger.info('Tableau Categorie', Tabcat);

                  docquery
                    .exec()
                    .then((user) => {
                      newoffer['_id'] = req.body._id ? req.body._id : uuidv4();
                      newoffer['title'] = req.body.title;
                      newoffer['description'] = req.body.description;
                      newoffer['price'] = req.body.price;
                      newoffer['creator'] = user._id;
                      newoffer['currency'] = 'EUR';
                      newoffer['pictures'] = req.body.pictures;
                      newoffer['city'] = req.body.city;
                      newoffer['categories'] = Tabcat;
                      newoffer['locations'] = req.body.locations;
                      newoffer['state'] = 'pending';
                      newoffer['CGU'] = req.body.CGU;
                      logger.info('newoffer', newoffer);

                      offer = new Offer(newoffer);
                      offer
                        .save()
                        .then(() => {
                          res.json(offer);
                        })
                        .catch((err) => {
                          logger.error(`Error - API - offerService - ${err}`);
                          res.status(500).send(err);
                        });
                    })
                    .catch((err) => {
                      logger.error(
                        `Error - API - userService - getById ${err}`
                      );
                      res.status(500).send(err);
                    });
                } else {
                  res.status(403).send({ error: 'No creator found' });
                }
                // res.json(Enfantcategories);
                // logger.info("Tableau Categorie", Tabcat);
              }
            })
            .catch((err) => {
              logger.error(`Error - API - categoryService - getById - ${err}`);
              // res.status(500).send(err);
            });
        }
        // res.json(categorie);
      }
    })
    .catch((err) => {
      logger.error(`Error - API - categorieService - getById - ${err}`);
      // res.status(500).send(err);
    });
}

function update(req, res) {
  Offer.findByIdAndUpdate(
    req.params._id,
    {
      $set: {
        title: req.body.title,
        currency: req.body.currency,
        price: req.body.price,
        description: req.body.description,
        state: req.body.state
      }
    },
    function (err, result) {
      if (err) {
        logger.error(err);
      }
      logger.info('RESULT: ' + result);
      res.send('Done');
    }
  );
}

function remove(req, res) {
  Offer.findByIdAndUpdate(
    req.params._id,
    { $set: { state: 'disable' } },
    function (err, result) {
      if (err) {
        logger.error(err);
      } else {
        const idcreator = result.creator;
        const docquery = User.findOne({ _id: idcreator });
        docquery
          .exec()
          .then((users) => {
            const emailcreator = users.email;
            logger.info('emailcreator', emailcreator);

            sendgrid.send({
              to: emailcreator,
              from: 'boanuncio@it-taskforce.com',
              subject: `Exclusão do seu anúncio`,
              text: 'Seu foi deletado'
            });
            logger.info('resultat de user', users.email);
            // logger.info("RESULT: " + result.creator);
            res.send('Done');
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    }
  );
}

function validate(req, res) {
  logger.info('verif cgu', req.params);

  Offer.findByIdAndUpdate(
    req.params._id,
    { $set: { state: 'enable' } },
    function (err, result) {
      if (err) {
        logger.error(err);
      } else {
        const idcreator = result.creator;
        const docquery = User.findOne({ _id: idcreator });
        docquery
          .exec()
          .then((users) => {
            const emailcreator = users.email;
            logger.info('emailcreator', emailcreator);

            sendgrid.send({
              to: emailcreator,
              from: 'boanuncio@it-taskforce.com',
              subject: `Validação do seu anúncio`,
              text: 'Seu anúncio já está online'
            });
            logger.info('resultat de user', users.email);
            // logger.info("RESULT: " + result.creator);
            res.send('Done');
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    }
  );
}

function pending(req, res) {
  Offer.findByIdAndUpdate(
    req.params._id,
    { $set: { state: 'pending' } },
    function (err, result) {
      if (err) {
        logger.error(err);
      }
      logger.info('RESULT: ' + result);
      res.send('Done');
    }
  );
}

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
  search,
  validate,
  pending,
  searchBack,
  getBack
};
