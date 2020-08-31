const csvToJson = require("convert-csv-to-json");

module.exports = () => {
  let referentielCodesDiplomesRncp = [];

  return {
    load: referentielCodesDiplomesRncpFile => {
      referentielCodesDiplomesRncp = csvToJson.getJsonFromCsv(referentielCodesDiplomesRncpFile);

      return {
        errors: 0,
        total: referentielCodesDiplomesRncp.length,
      };
    },

    findCodeEn: codeRNCP => {
      let found = referentielCodesDiplomesRncp.find(x => x.CodeRNCP === codeRNCP);
      return found ? found.CodeDiplome : null;
    },
    findNiveau: codeRNCP => {
      let found = referentielCodesDiplomesRncp.find(x => x.CodeRNCP === codeRNCP);
      return found ? found.Niveau2019 : null;
    },
    findType: codeRNCP => {
      let found = referentielCodesDiplomesRncp.find(x => x.CodeRNCP === codeRNCP);
      return found ? found.type : null;
    },
    findIntituleDiplome: codeRNCP => {
      let found = referentielCodesDiplomesRncp.find(x => x.CodeRNCP === codeRNCP);
      return found ? found.Intitule : null;
    },
    findCodeRNCP: codeEn => {
      let found = referentielCodesDiplomesRncp.find(x => x.CodeDiplome === codeEn);
      return found ? found.CodeRNCP : null;
    },
  };
};
