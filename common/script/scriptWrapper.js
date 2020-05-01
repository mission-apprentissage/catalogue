const moment = require("moment");
const { connectToMongo, closeMongoConnection } = require("../mongo");

process.on("unhandledRejection", e => console.log(e));
process.on("uncaughtException", e => console.log(e));

const createTimer = () => {
  let launchTime;
  return {
    start: () => {
      launchTime = new Date().getTime();
    },
    stop: results => {
      let duration = moment.utc(new Date().getTime() - launchTime).format("HH:mm:ss.SSS");
      let data = results && results.toJSON ? results.toJSON() : results;
      console.log(JSON.stringify(data || {}));
      console.log(`Completed in ${duration}`);
    },
  };
};

const handleError = error => {
  console.error(error.constructor.name === "EnvVarError" ? error.message : JSON.stringify(error));
  process.exitCode = 1;
};

const exit = async scriptError => {
  await closeMongoConnection()
    .then(() => {
      if (scriptError) {
        handleError(scriptError);
      }
    })
    .catch(closeError => handleError(closeError));
};

module.exports = {
  execute: async job => {
    try {
      let timer = createTimer();
      timer.start();
      await connectToMongo();
      let results = await job();
      timer.stop(results);
      await exit();
    } catch (e) {
      await exit(e);
    }
  },
};
