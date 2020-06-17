const { success, failure, badRequest } = require("../../common-api/response");
const { getUserFromToken, userIsSuperAdmin, createUser } = require("../../common-api/cognito");

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

  try {
    const currentUser = await getUserFromToken(body.refreshToken);

    await userIsSuperAdmin(currentUser);

    await createUser(body);

    /**
     *  RESPONSE
     * */
    callback(null, success({}));
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
