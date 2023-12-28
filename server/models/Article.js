const mongoose = require("mongoose");
const { Schema } = mongoose;

const ArticleSchema = new Schema({
  id: mongoose.ObjectId,
  title: String, // String is shorthand for {type: String}
  author: String,
  date: { type: Date, default: Date.now },
  body: String,
file:{
        id: {type: mongoose.ObjectId, required: true},
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        content: Buffer,
    },

    comments: [{ body: String, date: Date }],
  hidden: Boolean,
  meta: {
    votes: Number,
    favs: Number,
  },
});

module.exports = mongoose.model("Article", ArticleSchema);
