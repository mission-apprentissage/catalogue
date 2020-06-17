const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Establishment },
} = require("../common-api/getDependencies");
const { success, failure } = require("../common-api/response");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const { id: idEtablissement } = event.pathParameters;

  try {
    await connectToMongo();
    const establishment = await Establishment.findById(idEtablissement);
    closeMongoConnection();
    callback(
      null,
      success({
        // eslint-disable-next-line no-underscore-dangle
        ...establishment._doc,
      })
    );
  } catch (error) {
    callback(
      null,
      failure({
        error: error.message,
      })
    );
  }
};
