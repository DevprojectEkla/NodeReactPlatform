const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  id: mongoose.ObjectId,
    username: {type: String, unique:true}, // String is shorthand for {type: String}
  password: { type: String,  },
    email: { type: String, required: true },
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
    googleId: {type: String, unique:true},
});

module.exports = mongoose.model("User", UserSchema);
