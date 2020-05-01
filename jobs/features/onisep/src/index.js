const fs = require("fs");
const env = require("env-var");
const { execute } = require("../../../../common/scriptWrapper");
const { getS3ObjectAsStream } = require("../../../common/awsS3");
const importONISEP = require("./importONISEP");

execute(() => {
  const onisepFile = env.get("ONISEP_FILE").asString();
  const inputStream = onisepFile
    ? fs.createReadStream(onisepFile, { encoding: "UTF-8" })
    : getS3ObjectAsStream("mna-services/features/onisep/CATALOGUE_FORMATION_APPRENTISSAGE_20022020_retour_Onisep.csv");

  return importONISEP(inputStream);
});
