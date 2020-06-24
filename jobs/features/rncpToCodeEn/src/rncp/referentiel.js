const parseCodesDiplomesFile = require("./parseCodesDiplomesFile");

module.exports = () => {
  let referentiel = [];

  return {
    loadXmlFile: async codesDiplomesStream => {
      let { codesDiplomes } = await parseCodesDiplomesFile(codesDiplomesStream);

      referentiel = codesDiplomes;

      return {
        errors: 0,
        total: 0,
      };
    },
    findCodeEn: codeRNCP => {
      let codeEn = referentiel[codeRNCP] || null;

      return codeEn;
    },
  };
};
