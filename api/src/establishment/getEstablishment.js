const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Establishment },
} = require("../common-api/getDependencies");
const { success, failure, notFound } = require("../common-api/response");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const query = qs && qs.query ? JSON.parse(qs.query) : {};

  try {
    await connectToMongo();
    const establishment = await Establishment.findOne(query);
    closeMongoConnection();

    if (!establishment) {
      throw new Error("Not found");
    }

    callback(
      null,
      success({
        // eslint-disable-next-line no-underscore-dangle
        ...establishment._doc,
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
