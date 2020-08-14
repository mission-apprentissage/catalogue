const csvToJson = require("convert-csv-to-json");
const azureStorage = require("../../../../common-jobs/azureStorage");
const path = require("path");
const env = require("env-var");
const uniqBy = require("lodash").uniqBy;
const fs = require("fs");

const referentielCodesEnCodesIdccFilePath = path.join(__dirname, "../../src/assets/referentielCodesEnCodesIdcc.csv");
const referentielCodesIdccOpcoFilePath = path.join(__dirname, "../../src/assets/referentielCodesEnCodesIdcc.csv");

module.exports = async () => {
  // Check if  referentielCodesEnCodesIdcc is in local folder, if not gets it from azure
  if (!fs.existsSync(referentielCodesEnCodesIdccFilePath)) {
    const storage = azureStorage(env.get("AZURE_STORAGE_CONNECTION_STRING").asString());
    await storage.saveBlobToFile(
      "opco-container",
      "referentielCodesEnCodesIdcc.csv",
      referentielCodesEnCodesIdccFilePath
    );
  }

  // Load csv referential data
  const referentielRncpIdccs = csvToJson.getJsonFromCsv(referentielCodesEnCodesIdccFilePath);
  const referentielIdccsOpco = csvToJson.getJsonFromCsv(referentielCodesIdccOpcoFilePath);

  /**
   * Find Idccs for a Code En
   * @param {*} codeEn
   */
  const findIdccsFromCodeEn = codeEn => {
    const found = referentielRncpIdccs.filter(x => x.Codelaformation === codeEn && x.Statut === "CPNE");

    if (found.length > 0) {
      // Joining all idccs in one list without empty spaces
      const allIdccs = found
        .map(x => x.CodeIDCC)
        .join(",")
        .replace(/\s/g, "")
        .split(",");

      return [...new Set(allIdccs)]; // return all uniques idccs
    }

    return [];
  };

  /**
   * Find Opcos for idccs
   * @param {*} codesIdccs
   */
  const findOpcosFromIdccs = codesIdccs => {
    return referentielIdccsOpco.filter(x => codesIdccs.includes(x.IDCC));
  };

  return {
    findIdccsFromCodeEn: findIdccsFromCodeEn,
    findOpcosFromIdccs: findOpcosFromIdccs,
    findOpcosFromCodeEn: async codeRncp => {
      const codesIdcc = findIdccsFromCodeEn(codeRncp);
      return uniqBy(findOpcosFromIdccs(codesIdcc), "Opérateurdecompétences");
    },
  };
};
