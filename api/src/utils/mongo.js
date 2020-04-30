import mongoose from "mongoose";
import config from "../../../config";

// TODO return promise reject
export const connectToMongo = () => {
  const connectDbUri = `${config.mongo.endpoint}/${config.mongo.db}?retryWrites=true&w=majority`;
  console.log("MongoDB: Connection");

  // Set up default mongoose connection
  mongoose.connect(connectDbUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }); // Get Mongoose to use the global promise library
  mongoose.Promise = global.Promise; // Get the default connection
  const db = mongoose.connection;
  // Bind connection to error event (to get notification of connection errors)
  db.on("error", console.error.bind(console, "MongoDB: connection error:"));
  db.once("open", () => {
    console.log("MongoDB: Connected");
    Promise.resolve(db);
  });
};
