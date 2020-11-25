const csvToJson = require("convert-csv-to-json");

module.exports = () => {
  let referentielCodesDiplomesRncp = [];

  return {
    load: async referentielCodesDiplomesRncpFile => {
      referentielCodesDiplomesRncp = await csvToJson.getJsonFromCsv(referentielCodesDiplomesRncpFile);

      return {
        errors: 0,
        total: referentielCodesDiplomesRncp.length,
      };
    },
    findCodeEn: codeRNCP => {
      let found = referentielCodesDiplomesRncp.find(x => x.CodeRNCP === codeRNCP);
      return found ? found.CodeDiplome : null;
    },
    findCodeRNCP: codeEn => {
      let found = referentielCodesDiplomesRncp.find(x => x.CodeDiplome === codeEn);
      return found ? found.CodeRNCP : null;
    },
  };
};
