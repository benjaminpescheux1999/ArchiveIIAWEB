const mongoose = require('mongoose');

const _Offer = new mongoose.Schema(
  {
    _id: String,
    title: String,
    description: String,
    price: Number,
    currency: String,
    categories: { type: Array, default: [] },
    locations: { type: Array, default: [] },
    creator: String,
    pictures: { type: Array, default: [] },
    state: String,
    city: String,
    CGU: Boolean
  },
  {
    shardKey: { _id: 1, id: 1 },
    timestamps: true
  }
);

module.exports = _Offer;
