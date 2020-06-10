const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Establishment },
} = require("../common-api/getDependencies");
const { success, failure, badRequest } = require("../common-api/response");
const { findUserByAttribute } = require("../common-api/cognito");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event.body || event.body === "") {
    callback(
      null,
      badRequest({
        message: "something went wrong",
      })
    );
  }
  const body = JSON.parse(event.body);
  const { Authorization: token } = event.headers;

  try {
    if (!token || token === "") {
      callback(
        null,
        success({
          error: "Not authorize",
        })
      );
    }

    const user = await findUserByAttribute({ name: "custom:apiKey", value: token });

    if (!user) {
      callback(
        null,
        success({
          error: "Not authorize",
        })
      );
    }

    const listAcademie = user.Attributes["custom:access_academie"].split(",");
    if (!user.Attributes["custom:access_all"] && !listAcademie.includes(`${body.num_academie}`)) {
      callback(
        null,
        success({
          error: "Not authorize",
        })
      );
    }

    await connectToMongo();
    const establishment = Establishment(body);
    await establishment.save();
    console.log("Etablissement created", establishment);
    closeMongoConnection();
    /**
     *  RESPONSE
     * */
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
        error,
      })
    );
  }
};
