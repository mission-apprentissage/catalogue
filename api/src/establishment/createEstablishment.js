import { connectToMongo } from "../../../common/mongo";
import { success, failure, badRequest } from "../common-api/response";
import { Establishment } from "../models";
import { findUserByAttribute } from "../common-api/cognito";

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

    const establishment = Establishment(body);
    await establishment.save();
    console.log("Etablissement created", establishment);
    /**
     *  RESPONSE
     * */
    return success({
      // eslint-disable-next-line no-underscore-dangle
      ...establishment._doc,
    });
  } catch (error) {
    console.log(error);
    return failure({
      error,
    });
  }
};
