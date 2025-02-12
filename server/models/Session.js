const mongoose = require('mongoose');
const { Schema } = mongoose;
const { SESSION_EXP_TIME } = require('../../config');

const SessionSchema = new Schema({
  id: mongoose.ObjectId,
  sessionId: { type: String, required: true, unique: true }, // String is shorthand for {type: String}
  userData: { type: Object, required: true }, // String is shorthand for {type: String}
  creation_date: { type: Date, default: Date.now },
  expiration_time: { type: Date },
});
// To set an expiration time for a Mongoose schema field in MongoDB, you can use the expires option with the TTL (Time-To-Live) index. This allows you to automatically remove documents from the collection after a certain amount of time.
// BEWARE: WHEN MODIFYING THE SCHEMA HERE YOU HAVE TO DELETE THE CORRESPONDING MONGODB COLLECTION TO SEE CHANGES ON YOUR DATABASE
SessionSchema.index(
  { creation_date: 1 },
  { expireAfterSeconds: SESSION_EXP_TIME }
);

module.exports = mongoose.model('Session', SessionSchema);
