const csvToJson = require("convert-csv-to-json");

module.exports = () => {
  let referentielBlocCompetences = [];

  return {
    load: referentielBlocFile => {
      referentielBlocCompetences = csvToJson.getJsonFromCsv(referentielBlocFile);

      return {
        errors: 0,
        total: referentielBlocCompetences.length,
      };
    },
    findBlocsCompetences: codeRNCP => {
      let found = referentielBlocCompetences.filter(x => x.CodeRNCP === codeRNCP);
      return found.length > 0 ? found : [];
    },
  };
};
