import { success, failure, badRequest } from "../../utils/response";
import { getUserFromToken, userIsSuperAdmin, createUser } from "../../utils/cognito";

export default async event => {
  if (!event.body || event.body === "") {
    return badRequest({
      message: "something went wrong",
    });
  }
  const body = JSON.parse(event.body);

  try {
    const currentUser = await getUserFromToken(body.refreshToken);

    await userIsSuperAdmin(currentUser);

    await createUser(body);

    /**
     *  RESPONSE
     * */
    return success({});
  } catch (error) {
    return failure({
      error,
    });
  }
};
