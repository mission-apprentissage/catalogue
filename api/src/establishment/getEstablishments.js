import { connectToMongo } from "../utils/mongo";
import { success, failure } from "../utils/response";
import { Establishment } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const query = event.queryStringParameters ? event.queryStringParameters.query : {};
  const page = event.queryStringParameters ? event.queryStringParameters.page : 1;
  const limit = event.queryStringParameters ? event.queryStringParameters.limit : 10;

  try {
    await connectToMongo();
    const results = await Establishment.paginate(query, { page, limit });

    /**
     *  Response
     * */
    return success({
      etablissements: results.docs,
      pagination: {
        page: results.page,
        resultats_par_page: limit,
        nombre_de_page: results.pages,
        total: results.total,
      },
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
