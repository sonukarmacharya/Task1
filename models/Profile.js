const mongoose = require("mongoose");

const Profileschema = mongoose.Schema({
  user_id: {
    type: String,
  },
  image: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Profile", Profileschema);
