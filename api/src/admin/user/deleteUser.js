const { success, failure, badRequest } = require("../../common-api/response");
const { userIsSuperAdmin, getUserFromToken, deleteUser } = require("../../common-api/cognito");

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

    await deleteUser(username);
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
