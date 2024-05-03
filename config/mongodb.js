const mongoose = require("mongoose");
const mongoConnexion = async () => {
  try {
    const connexion = await mongoose.connect(process.env.MONGO_URI, {
        //Options: see =>
        //https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connection-options/
      // useNewUrlParser: true, deprecated
    });
    console.log(`MongoDb connexion succeeded: ${connexion.connection.host}`);
    return connexion;
  } catch (error) {
    console.log(error);
  }
};
mongoose.connection.on("error", (err) => {
  console.log(err);

});

module.exports = mongoConnexion;
