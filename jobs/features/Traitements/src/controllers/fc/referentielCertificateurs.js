const csvToJson = require("convert-csv-to-json");

module.exports = () => {
  let referentielCertificateurs = [];

  return {
    load: referentielCertificateursFile => {
      referentielCertificateurs = csvToJson.getJsonFromCsv(referentielCertificateursFile);

      return {
        errors: 0,
        total: referentielCertificateurs.length,
      };
    },
    findInfo: codeRNCP => {
      let found = referentielCertificateurs.filter(x => x.CodeRNCP === codeRNCP);
      return found.length > 0 ? found : [];
    },
  };
};
