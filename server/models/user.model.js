const mongoose = require('mongoose');
const _User = new mongoose.Schema(
  {
    _id: String,
    username: String,
    password: String,
    email: String,
    phone: String,
    role: Number,
    validat: Boolean
  },
  {
    shardKey: { _id: 1, id: 1 },
    timestamps: true
  }
);
module.exports = _User;
