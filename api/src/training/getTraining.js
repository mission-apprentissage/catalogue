import { connectToMongo } from "../../../common/mongo";
import { success, failure, notFound } from "../common-api/response";
import { Formation } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const query = event.queryStringParameters ? event.queryStringParameters.query : {};

  try {
    await connectToMongo();
    const formation = await Formation.findOne(query);

    return success({
      // eslint-disable-next-line no-underscore-dangle
      ...formation._doc,
    });
  } catch (error) {
    if (error.meta.statusCode === 404) {
      return notFound({
        error: "Not found",
      });
    }
    return failure({
      error,
    });
  }
};
