const mongoose = require("mongoose");
const { config } = require("../../config");

let mongooseInstance = mongoose;
const connectToMongo = (endpoint = null, dbname = null, mongooseInst = null) =>
  new Promise((resolve, reject) => {
    const connectDbUri = `${endpoint || config.mongo.endpoint}/${dbname ||
      config.mongo.db}?retryWrites=true&w=majority`;
    console.log(`MongoDB: Connection to ${connectDbUri}`);

    mongooseInstance = mongooseInst || mongoose;
    // Set up default mongoose connection
    mongooseInstance.connect(connectDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }); // Get Mongoose to use the global promise library
    mongooseInstance.Promise = global.Promise; // Get the default connection
    const db = mongooseInstance.connection;
    // Bind connection to error event (to get notification of connection errors)
    db.on("error", () => {
      console.error.bind(console, "MongoDB: connection error:");
      reject();
    });
    db.once("open", () => {
      console.log("MongoDB: Connected");
      resolve(db);
    });
  });

module.exports.connectToMongo = connectToMongo;
module.exports.closeMongoConnection = () => mongooseInstance.connection.close();
