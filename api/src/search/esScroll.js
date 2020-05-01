import { success, failure, badRequest } from "../common-api/response";
import { getElasticInstance } from "../common-api/es";

const esClient = getElasticInstance();

export default async event => {
  try {
    const { index } = event.pathParameters;

    let scrollId = null;
    if (event.queryStringParameters && event.queryStringParameters.scroll_id) {
      scrollId = event.queryStringParameters.scroll_id;
    }

    if (scrollId) {
      const response = await esClient.scroll({
        scrollId,
        scroll: "1m",
      });
      return success(response.body);
    }

    if (!event.body || event.body === "") {
      return badRequest({
        message: "something went wrong",
      });
    }

    const response = await esClient.search({
      index,
      scroll: "1m",
      size: 100,
      body: event.body,
    });

    /**
     *  Response
     * */
    return success(response.body);
  } catch (error) {
    return failure({
      error,
    });
  }
};
