import { connectToMongo, closeMongoConnection } from "../../../common/mongo";
import { success, failure, notFound } from "../common-api/response";
import { Establishment } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const query = event.queryStringParameters ? event.queryStringParameters.query : {};

  try {
    await connectToMongo();
    const establishment = await Establishment.findOne(query);
    closeMongoConnection();
    return success({
      // eslint-disable-next-line no-underscore-dangle
      ...establishment._doc,
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
