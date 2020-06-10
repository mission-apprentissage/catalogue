const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Formation },
} = require("../common-api/getDependencies");
const { success, failure } = require("../common-api/response");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const query = qs && qs.query ? JSON.parse(qs.query) : {};

  try {
    await connectToMongo();
    const count = await Formation.countDocuments(query);
    closeMongoConnection();

    callback(
      null,
      success({
        count,
      })
    );
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
