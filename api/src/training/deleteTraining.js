const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Formation },
} = require("../common-api/getDependencies");
const { success, failure } = require("../common-api/response");
const { findUserByAttribute } = require("../common-api/cognito");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const { id: idFormation } = event.pathParameters;
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

    const formation = await Formation.findById(idFormation);

    let hasRightToEdit = user.Attributes["custom:access_all"];
    if (!hasRightToEdit) {
      const listAcademie = user.Attributes["custom:access_academie"].split(",");
      hasRightToEdit = listAcademie.includes(`${formation.num_academie}`);
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

    await Formation.findOneAndRemove({ _id: idFormation });
    closeMongoConnection();
    /**
     *  Response
     * */
    callback(null, success({ success: true }));
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
