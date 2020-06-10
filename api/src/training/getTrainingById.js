const { connectToMongo, closeMongoConnection } = require("../../../common/mongo");
const { success, failure, notFound } = require("../common-api/response");
const { Formation } = require("../../../jobs/common-jobs/models");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const { id: idFormation } = event.pathParameters;

  try {
    await connectToMongo();
    const formation = await Formation.findById(idFormation);
    closeMongoConnection();
    callback(
      null,
      success({
        // eslint-disable-next-line no-underscore-dangle
        ...formation._doc,
      })
    );
  } catch (error) {
    if (error.meta.statusCode === 404) {
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
        error,
      })
    );
  }
};
