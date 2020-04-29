import { success, failure, badRequest } from "../../utils/response";
import { userIsSuperAdmin, getUserFromToken, deleteUser } from "../../utils/cognito";

export default async event => {
  if (!event.body || event.body === "") {
    return badRequest({
      message: "something went wrong",
    });
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
    return success({ success: true });
  } catch (error) {
    return failure({
      error,
    });
  }
};
