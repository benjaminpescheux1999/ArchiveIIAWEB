const mongoose = require('mongoose');

const _Category = new mongoose.Schema(
  {
    _id: String,
    name: String,
    parent: String
  },
  {
    shardKey: { _id: 1, id: 1 },
    timestamps: true
  }
);

module.exports = _Category;
