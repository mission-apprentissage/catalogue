const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Formation },
} = require("../common-api/getDependencies");
const { success, failure, notFound } = require("../common-api/response");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const { id: idFormation } = event.pathParameters;

  try {
    await connectToMongo();
    const formation = await Formation.findById(idFormation);
    closeMongoConnection();

    if (!formation) {
      throw new Error("Not found");
    }

    callback(
      null,
      success({
        // eslint-disable-next-line no-underscore-dangle
        ...formation._doc,
      })
    );
  } catch (error) {
    if (error.message === "Not found") {
      callback(
        null,
        notFound({
          error: "Not found",
        })
      );
    }
    callback(
      null,
      failure({
        error: error.message,
      })
    );
  }
};
