const { User } = require('../mongo');
const bcrypt = require('bcryptjs');
const ReadPreference = require('mongodb').ReadPreference;
const logger = require('../config/winston');

let jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sendgrid = require('@sendgrid/mail');

const saltRounds = 10;
const JWT_EXPIRATION_TIME = '7200000';
const BASE_URL = 'http://localhost:8000';
const SENDGRID_KEY =
  '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';
// const SENDGRID_KEY =
//   "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";

sendgrid.setApiKey(SENDGRID_KEY);

require('../mongo');
const jwtsecret = 'temp';
function get(req, res) {
  const docquery = User.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

async function getByIdExtern(r_id) {
  return new Promise((resolve, reject) => {
    logger.info(`Debug - API - req.body: ${JSON.stringify(r_id)}`);
    const docquery = User.findOne({ _id: r_id });
    docquery
      .exec()
      .then((user) => {
        logger.info(`Debug - API - userService - user data: ${user}`);
        resolve(user);
        //logger.info(`Debug - find by id result: ${JSON.stringify(user)}`)
      })
      .catch((err) => {
        logger.error(`Error - API - userService - getById ${err}`);
        reject(err);
      });
  });
}

function getById(req, res) {
  const docquery = User.findOne({ _id: req.params._id });
  docquery
    .exec()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

function create(req, res) {
  let tmp = {};
  const check = User.find({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  });
  // const checkemail = User.find({email: req.body.email
  // });
  // const checkusername = User.find({email: req.body.username
  // });
  check
    .exec()
    .then((checked) => {
      console.log('checked', checked);
      if (
        checked[0].email == req.body.email &&
        checked[0].username != req.body.username
      ) {
        res.json({
          erremail: 'email déjà utilisé',
          errusername: '',
          errcompte: ''
        });
      }
      if (
        checked[0].username == req.body.username &&
        checked[0].email != req.body.email
      ) {
        res.json({
          erremail: '',
          errusername: 'username déjà utilisé',
          errcompte: ''
        });
      }
      if (
        checked[0].email == req.body.email &&
        checked[0].username == req.body.username
      ) {
        res.json({
          errcompte: 'compte déjà utilisé',
          erremail: 'email déjà utilisé',
          errusername: 'username déjà utilisé'
        });
        console.log('verif username', checked);
      }
      if (
        checked[0].email != req.body.email &&
        checked[0].username != req.body.username
      ) {
        if (req.body.password.substring(1, 3) != '2y') {
          bcrypt.hash(req.body.password, saltRounds, (error, result) => {
            if (!error) {
              tmp['_id'] = uuidv4();
              tmp['username'] = req.body.username;
              tmp['email'] = req.body.email;
              tmp['password'] = result;
              tmp['phone'] = req.body.phone;
              tmp['role'] = req.body.role;

              const docquery = new User(tmp);
              docquery
                .save()
                .then((user) => {
                  let token = jwt.sign(
                    { username: user.username, _id: user._id },
                    jwtsecret,
                    { expiresIn: JWT_EXPIRATION_TIME }
                  );
                  res.json({ token: token, username: user.username });
                  sendgrid.send({
                    to: req.body.email,
                    from: 'boanuncio@it-taskforce.com',
                    subject: `Criação de conta`,
                    text: `Parabéns ${user.username} sua conta foi criada.`
                  });
                  // sendgrid.send({
                  //   to: req.body.email,
                  //   from: 'boanuncio@it-taskforce.com',
                  //   subject: `Criação de conta`,
                  //   text: `Parabéns ${user.username} sua conta foi criada,
                  //   veuillez confirmer activer votre compte ici http://localhost:8000/test`
                  // });
                })
                .catch((err) => {
                  logger.error(`Error - API - userService - ${err}`);
                  res.status(500).send(err);
                });
            } else {
              logger.error(`Error - API - userService - ${error}`);
            }
          });
        } else {
          const docquery = new User(req.body);
          docquery
            .save()
            .then((user) => {
              res.json(user);
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        }
      }
    })
    .catch((err) => {
      if (req.body.password.substring(1, 3) != '2y') {
        bcrypt.hash(req.body.password, saltRounds, (error, result) => {
          if (!error) {
            tmp['_id'] = uuidv4();
            tmp['username'] = req.body.username;
            tmp['email'] = req.body.email;
            tmp['password'] = result;
            tmp['phone'] = req.body.phone;
            tmp['role'] = req.body.role;

            const docquery = new User(tmp);
            docquery
              .save()
              .then((user) => {
                let token = jwt.sign(
                  { username: user.username, _id: user._id },
                  jwtsecret,
                  { expiresIn: JWT_EXPIRATION_TIME }
                );
                res.json({ token: token, username: user.username });
                sendgrid.send({
                  to: req.body.email,
                  from: 'boanuncio@it-taskforce.com',
                  subject: `Criação de conta`,
                  text: `Parabéns ${user.username} sua conta foi criada.`
                });
                // sendgrid.send({
                //   to: req.body.email,
                //   from: 'boanuncio@it-taskforce.com',
                //   subject: `Criação de conta`,
                //   text: `Parabéns ${user.username} sua conta foi criada,
                //   veuillez confirmer activer votre compte ici http://localhost:8000/test`
                // });
              })
              .catch((err) => {
                logger.error(`Error - API - userService - ${err}`);
                res.status(500).send(err);
              });
          } else {
            logger.error(`Error - API - userService - ${error}`);
          }
        });
      } else {
        const docquery = new User(req.body);
        docquery
          .save()
          .then((user) => {
            res.json(user);
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    });
}

function update(req, res) {
  // logger.info('service update', req.body);
  console.log('service update', req.body.pseudo);
  console.log('validate', req.body.validation);
  console.log('req.params._id', req.params._id);

  if (req.body.validation) {
    console.log('passage');
    const docquery = User.findOne({ username: req.body.pseudo });
    docquery
      .exec()
      .then((users) => {
        console.log('mon id', users._id);
        User.findByIdAndUpdate(
          users._id,
          {
            $set: {
              validat: req.body.validation
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
      })
      .catch((err) => {
        console.log('non');
      });
  } else {
    User.findByIdAndUpdate(
      req.params._id,
      {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        role: req.body.role
      },
      function (err, result) {
        if (err) {
          // logger.error(`Debug - API - Error: ${err}`);
          res.send(err);
        } else {
          //logger.info(`Debug - API - update user result ${JSON.stringify(result)}`);
          res.send(result);
        }
      }
    );
  }
}

function remove(req, res) {
  logger.info(`Debug - API - remove user: ${req.params._id}`);
  User.findOneAndRemove({ _id: req.params._id })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

// Sur une offre on envoie le username de l'utilisateur pour envoyer un email
function sendMail(req, res) {
  logger.info(`Message important 1 ${JSON.stringify(req.body)}`);
  const docquery = User.findOne({ username: req.body.seller });
  const buyer = User.findOne({ username: req.body.buyer });

  docquery
    .exec()
    .then((user) => {
      logger.info(`Message important 2 ${JSON.stringify(user)}`);
      if (user && user.email && req.body.message) {
        logger.info('user', user.seller);
        buyer.exec().then((buyer) => {
          logger.info(`BUYER EMAIL ${JSON.stringify(buyer.email)}`);
          sendgrid.send({
            to: user.email,
            from: 'boanuncio@it-taskforce.com',
            subject: `Você recebeu uma mensagem de ${req.body.buyer}`,
            text: `${req.body.message} responda aqui: ${buyer.email}`
          });
          logger.info('Envoyé!!');

          res.json({ result: 1 });
        });
      } else {
        if (!req.body.message) {
          logger.error(`Error - API - userService - message is empty`);
        }
        res.json({ result: 0 });
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
}

function login(req, res, next) {
  const docquery = User.findOne({ email: req.body.email });
  logger.info(
    `Debug - API - userService - login info: ${JSON.stringify(req.body)}`
  );
  docquery
    .exec()
    .then((user) => {
      //const tmp_str = req.body.password.substring(1, 3);
      if (user) {
        if (!req.body.password) {
          res
            .status(403)
            .send(err ? { error: err } : { error: 'Wrong password' });
        } else {
          pass = bcrypt.compare(
            req.body.password,
            user.password,
            (error, result) => {
              logger.info(
                `Debug - API - userService - compare result: ${result}`
              );
              if (!error && result === true) {
                logger.info(`Debug - API - user ${user.username} logged in`);
                let token = jwt.sign(
                  { username: user.username, _id: user._id },
                  jwtsecret,
                  { expiresIn: JWT_EXPIRATION_TIME }
                );
                logger.info(
                  `Debug - API - userService - new token ${token} for user ${user.username}`
                );
                res.json({ token: token, username: user.username });
              } else {
                res.status(403).send({});
              }
            }
          );
        }
      }
    })
    .catch((err) => {
      logger.error(`Error - API - userService - ${err}`);
      res.status(500).send(err);
    });
}

function loginAdmin(req, res, next) {
  const docquery = User.findOne({ email: req.body.email, role: 3 });
  logger.info(
    `Debug - API - userService - login info: ${JSON.stringify(req.body)}`
  );
  docquery
    .exec()
    .then((user) => {
      //const tmp_str = req.body.password.substring(1, 3);
      if (user) {
        if (!req.body.password) {
          res
            .status(403)
            .send(err ? { error: err } : { error: 'Wrong password' });
        } else {
          pass = bcrypt.compare(
            req.body.password,
            user.password,
            (error, result) => {
              logger.info(
                `Debug - API - userService - compare result: ${result}`
              );
              if (!error && result === true) {
                logger.info(`Debug - API - user ${user.username} logged in`);
                let token = jwt.sign(
                  { username: user.username, _id: user._id },
                  jwtsecret,
                  { expiresIn: JWT_EXPIRATION_TIME }
                );
                logger.info(
                  `Debug - API - userService - new token ${token} for user ${user.username}`
                );
                res.json({ token: token, username: user.username });
              } else {
                res.status(403).send({});
              }
            }
          );
        }
      }
    })
    .catch((err) => {
      if (err == "TypeError: Cannot read property 'role' of null") {
        const messageadmnin = 'vous devez être Administrateur';
        res.json({ message: messageadmnin });
      } else {
        logger.error(`Error - API - userService - ${err}`);
        res.status(500).send(err);
      }
    });
}

module.exports = {
  get,
  getById,
  getByIdExtern,
  create,
  update,
  remove,
  login,
  sendMail,
  loginAdmin
};
