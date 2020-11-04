const mongoose = require("mongoose");
const { config } = require("../config");

let mongooseInstance = mongoose;
const connectToMongo = (endpoint = null, dbname = null, mongooseInst = null) =>
  new Promise((resolve, reject) => {
    const connectDbUri = `${endpoint || config.mongo.endpoint}/${dbname ||
      config.mongo.db}?retryWrites=true&w=majority`;
    console.log(`MongoDB: Connection to ${connectDbUri}`);

    const mongooseInstanceTmp = mongooseInst || mongooseInstance;
    // Set up default mongoose connection
    mongooseInstanceTmp.connect(connectDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }); // Get Mongoose to use the global promise library
    mongooseInstanceTmp.Promise = global.Promise; // Get the default connection
    const db = mongooseInstanceTmp.connection;
    // Bind connection to error event (to get notification of connection errors)
    db.on("error", () => {
      console.error.bind(console, "MongoDB: connection error:");
      reject();
    });
    db.once("open", () => {
      console.log("MongoDB: Connected");
      resolve(mongooseInstanceTmp);
    });
  });

module.exports.mongooseInstance = mongooseInstance;
module.exports.connectToMongo = connectToMongo;
module.exports.closeMongoConnection = (mongooseInst = mongooseInstance) => {
  console.log("MongoDB: Closed");
  mongooseInst.connection.close();
};
