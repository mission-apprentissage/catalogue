import { success, failure, badRequest } from "../common-api/response";
import { getElasticInstance } from "../common-api/es";

const esClient = getElasticInstance();

export default async event => {
  const { body } = event;

  try {
    if (!body || body === "") {
      return badRequest({ message: "something went wrong" });
    }
    console.log({ body: [body] });
    const result = await esClient.msearch({ body: [body] });

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
