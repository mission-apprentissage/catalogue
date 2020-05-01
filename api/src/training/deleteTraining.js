import { connectToMongo } from "../../../common/mongo";
import { success, failure } from "../utils/response";
import { Formation } from "../models";
import { findUserByAttribute } from "../utils/cognito";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const { id: idFormation } = event.pathParameters;
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

    await connectToMongo();

    const formation = await Formation.findById(idFormation);

    let hasRightToEdit = user.Attributes["custom:access_all"];
    if (!hasRightToEdit) {
      const listAcademie = user.Attributes["custom:access_academie"].split(",");
      hasRightToEdit = listAcademie.includes(`${formation.num_academie}`);
    }
    if (!hasRightToEdit) {
      return success({
        error: "Not authorize",
      });
    }

    await Formation.findOneAndRemove({ _id: idFormation });

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
