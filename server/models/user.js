const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: false
  },
  email: {
    type: String,
    required: true,
    unique: false
  },
  avatar: {
    type: String,
    required: false,
    unique: false
  },
  roles: {
    type: Object,
    default: []
  },
  last_online: {
    type: Date,
    required: false
  },
  access_token: {
    type: String,
    required: true,
    unique: false
  },
  refresh_token: {
    type: String,
    required: true,
    unique: false
  },
  favorites: {
    type: Object,
    required: true,
    unique: false,
    default: []
  },
  layout: {
    type: Object,
    required: false,
    unique: false,
    default: []
  }
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);