const csvToJson = require("convert-csv-to-json");

module.exports = () => {
  let referentielNsf = [];

  return {
    load: referentielNsfFile => {
      referentielNsf = csvToJson.getJsonFromCsv(referentielNsfFile);

      return {
        errors: 0,
        total: referentielNsf.length,
      };
    },
    findNsf: codeRNCP => {
      let found = referentielNsf.filter(x => x.CodeRNCP === codeRNCP);
      return found.length > 0 ? found : [];
    },
  };
};
