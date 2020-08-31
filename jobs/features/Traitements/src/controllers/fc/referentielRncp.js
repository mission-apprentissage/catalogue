const csvToJson = require("convert-csv-to-json");

module.exports = () => {
  let referentielRncp = [];

  return {
    load: referentielRncpFile => {
      referentielRncp = csvToJson.getJsonFromCsv(referentielRncpFile);

      return {
        errors: 0,
        total: referentielRncp.length,
      };
    },
    findInfo: codeRNCP => {
      let found = referentielRncp.filter(x => x.CodeRNCP === codeRNCP);
      return found.length > 0 ? found : [];
    },
  };
};
