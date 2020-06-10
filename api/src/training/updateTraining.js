const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Formation },
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

    await Formation.findOneAndUpdate({ _id: idFormation }, body, { new: true });
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
