const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  id: mongoose.ObjectId,
  username: String, // String is shorthand for {type: String}
  password: String,
    email: String,
    quote: String,
  creation_date: { type: Date, default: Date.now },
    expiration_time: {type: Date},
avatar:{
        id: {type: mongoose.ObjectId, required: true},
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
    content: String,
        uniqueName: String,
    },

  admin: Boolean,
});

module.exports = mongoose.model("User", UserSchema);
