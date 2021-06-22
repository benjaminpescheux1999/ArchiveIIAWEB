const mongoose = require('mongoose');
const _Category = require('./models/category.model');
const _Location = require('./models/location.model');
const _User = require('./models/user.model');
const _Offer = require('./models/offer.model');
const logger = require('./config/winston');


mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

// Sample found here https://docs.microsoft.com/en-us/azure/cosmos-db/connect-mongodb-account
//TODO: set COSMOSDB_URL as an environment variable
const COSMOSDB_URL =
  'mongodb://lbc-db:11svapZPsxXcyqRzcV7Gj6MsIufy8tQVs2RoAk3onntMD2BujehRfImd04sOZTYU3WVMEcRdXkdvwAwYlOQlbQ==@lbc-db.documents.azure.com:10255/lbc-db-dev?ssl=true&replicaSet=globaldb';
mongoose
  .connect(COSMOSDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => logger.info('Connection to CosmosDB successful...'))
  .catch((err) => logger.error(err));

const Category = mongoose.connection.model('Category', _Category);
const Location = mongoose.connection.model('Location', _Location);
const User = mongoose.connection.model('User', _User);
const Offer = mongoose.connection.model('Offer', _Offer);

module.exports = {
  Category,
  Location,
  User,
  Offer
};
