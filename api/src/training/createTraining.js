import { connectToMongo } from "../utils/mongo";
import { success, failure, badRequest } from "../utils/response";
import { Formation } from "../models";
import { findUserByAttribute } from "../utils/cognito";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event.body || event.body === "") {
    return badRequest({
      message: "something went wrong",
    });
  }
  const body = JSON.parse(event.body);
  const { Authorization: token } = event.headers;

  try {
    if (!token || token === "") {
      return success({
        error: "Not authorize",
      });
    }

    const user = await findUserByAttribute({ name: "custom:apiKey", value: token });

    if (!user) {
      return success({
        error: "Not authorize",
      });
    }

    const listAcademie = user.Attributes["custom:access_academie"].split(",");
    if (!user.Attributes["custom:access_all"] && !listAcademie.includes(`${body.num_academie}`)) {
      return success({
        error: "Not authorize",
      });
    }

    await connectToMongo();
    const formation = Formation(body);
    await formation.save();
    console.log("Training created", formation);
    /**
     *  RESPONSE
     * */
    return success({
      // eslint-disable-next-line no-underscore-dangle
      ...formation._doc,
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
