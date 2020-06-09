const { success, failure } = require("../../common-api/response");
const { getUserFromToken, userIsSuperAdmin, listUsers } = require("../../common-api/cognito");

module.exports.handler = async (event, context, callback) => {
  try {
    const refreshToken = event.queryStringParameters ? event.queryStringParameters.refreshToken : null;

    const user = await getUserFromToken(refreshToken);

    const isAdmin = await userIsSuperAdmin(user);

    const { Users: users } = await listUsers();

    const resp = users.map(u => {
      return {
        ...u,
        Attributes: Object.assign(...u.Attributes.map(attr => ({ [attr.Name]: attr.Value }))),
      };
    });

    /**
     *  Response
     * */
    callback(
      null,
      success({
        users: resp,
        isAdmin,
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
