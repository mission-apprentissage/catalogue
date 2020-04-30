import { success, failure, badRequest } from "../utils/response";
import { getElasticInstance } from "../utils/es";

const esClient = getElasticInstance();

export default async event => {
  const { pathParameters, queryStringParameters, body } = event;
  const { index } = pathParameters;

  try {
    if (!body || body === "") {
      return badRequest({ message: "something went wrong" });
    }

    const result = await esClient.msearch({ index, ...queryStringParameters, body });

    /**
     *  Response
     * */
    return success(result.body);
  } catch (error) {
    return failure({
      error,
    });
  }
};
