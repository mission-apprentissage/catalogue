const csvToJson = require("convert-csv-to-json");
const path = require("path");
const uniqBy = require("lodash").uniqBy;

module.exports = () => {
  // Load csv referential data
  const referentielRncpIdccs = csvToJson.getJsonFromCsv(
    path.join(__dirname, "../../src/assets/referentielCodesEnCodesIdcc.csv")
  );
  const referentielIdccsOpco = csvToJson.getJsonFromCsv(
    path.join(__dirname, "../../src/assets/referentielCodesIdccOpco.csv")
  );

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
