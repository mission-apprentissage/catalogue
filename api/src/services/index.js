// import { connectToMongo, closeMongoConnection } from "../../../common/mongo";
import { success, failure, notFound } from "../common-api/response";
// import { Formation } from "../models";
import { run } from "../../../jobs/features/etablissements/etablishmentsUpdater/src/etablishmentsUpdater";

// console.log(run);

const services = async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const job = qs && qs.job ? qs.job : "etablissement";

  const result = {};
  try {
    switch (job) {
      case "etablissement":
        run({ _id: "5e8df8c220ff3b2161267f26" });
        break;
      case "":
      default:
        return notFound({
          error: "Not found",
        });
    }
    // await connectToMongo();
    // const formation = await Formation.findById(idFormation);
    // closeMongoConnection();
    return success({
      ...result,
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};

export const servicesHandler = services;
