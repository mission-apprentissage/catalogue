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
  const { id: idEtablissement } = event.pathParameters;
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

    await connectToMongo();

    const establishment = await Establishment.findById(idEtablissement);
    let hasRightToEdit = user.Attributes["custom:access_all"];
    if (!hasRightToEdit) {
      const listAcademie = user.Attributes["custom:access_academie"].split(",");
      hasRightToEdit = listAcademie.includes(`${establishment.num_academie}`);
    }
    if (!hasRightToEdit) {
      closeMongoConnection();
      callback(
        null,
        success({
          error: "Not authorize",
        })
      );
    }

    const result = await Establishment.findOneAndUpdate({ _id: idEtablissement }, body, { new: true });
    closeMongoConnection();
    /**
     *  Response
     * */
    // eslint-disable-next-line no-underscore-dangle
    callback(null, success({ ...result._doc }));
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
