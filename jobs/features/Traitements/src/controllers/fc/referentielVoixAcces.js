const csvToJson = require("convert-csv-to-json");

module.exports = () => {
  let referentielVoixAcces = [];

  return {
    load: file => {
      referentielVoixAcces = csvToJson.getJsonFromCsv(file);

      return {
        errors: 0,
        total: referentielVoixAcces.length,
      };
    },
    findVoix: codeRNCP => {
      let found = referentielVoixAcces.filter(x => x.CodeRNCP === codeRNCP);
      return found.length > 0 ? found : [];
    },
  };
};
