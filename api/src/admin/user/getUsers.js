import { success, failure } from "../../utils/response";
import { getUserFromToken, userIsSuperAdmin, listUsers } from "../../utils/cognito";

export default async event => {
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
    return success({
      users: resp,
      isAdmin,
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
