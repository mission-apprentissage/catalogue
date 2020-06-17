const { success, failure, badRequest } = require("../../common-api/response");
const { getUserFromToken, userIsSuperAdmin, updateUser } = require("../../common-api/cognito");

module.exports.handler = async (event, context, callback) => {
  if (!event.body || event.body === "") {
    callback(
      null,
      badRequest({
        message: "something went wrong",
      })
    );
  }
  const body = JSON.parse(event.body);
  const { username } = event.pathParameters;

  try {
    const currentUser = await getUserFromToken(body.refreshToken);

    await userIsSuperAdmin(currentUser);

    const { apiKey, accessAll, accessAcademie } = body;
    if (username && apiKey && accessAcademie) {
      await updateUser(username, [
        {
          Name: "custom:access_all",
          Value: accessAll === true ? "true" : "false",
        },
        {
          Name: "custom:apiKey",
          Value: apiKey,
        },
        {
          Name: "custom:access_academie",
          Value: accessAcademie,
        },
      ]);
    }

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
