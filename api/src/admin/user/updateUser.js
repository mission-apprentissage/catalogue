import { success, failure, badRequest } from "../../common-api/response";
import { getUserFromToken, userIsSuperAdmin, updateUser } from "../../common-api/cognito";

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
    return success({ success: true });
  } catch (error) {
    return failure({
      error,
    });
  }
};
