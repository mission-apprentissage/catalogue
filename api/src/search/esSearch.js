import { success, failure, badRequest } from "../utils/response";
import { getElasticInstance } from "../utils/es";

const esClient = getElasticInstance();

export default async event => {
  try {
    if (!event.body || event.body === "") {
      return badRequest({
        message: "something went wrong",
      });
    }
    const { index } = event.pathParameters;

    const result = await esClient.msearch({
      index,
      body: event.body,
    });

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
