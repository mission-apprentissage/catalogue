const logger = require("../../../common-jobs/Logger").mainLogger;
const { connectToMongo, closeMongoConnection } = require("../../../../common/mongo");
const { Formation } = require("../../../../common/models2");
const { toXlsx } = require("./utils/exporter");
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;

const run = async () => {
  try {
    await connectToMongo();
    const opcoToSearch = "OPCO entreprises de proximité";
    await exportDataForOpco(opcoToSearch, "dataForOpcoEP");
    closeMongoConnection();
  } catch (err) {
    logger.error(err);
  }
};

const exportDataForOpco = async (opcoName, exportFileName) => {
  logger.info(" -- Export of OPCOs Data -- ");
  const dataForOpco = [];
  const formationsForOpco = await Formation.find({ opcos: `${opcoName}` });

  // Todo foreach formation build object with etablissement

  // Todo export dataForOpco to xls
  dataForOpco.push({
    test: "123",
  });
  dataForOpco.push({
    test: "456",
  });

  // Export to xlsx
  await toXlsx(dataForOpco, ".", `${exportFileName}.xlsx`, exportFileName, {});
  await logger.info(" -- End Stats of OPCO Export -- ");
};

run();
