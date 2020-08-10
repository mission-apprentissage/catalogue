const parseCodesDiplomesFile = require("./parseCodesDiplomesFile");

module.exports = () => {
  let referentiel = [];

  return {
    load: async codesDiplomesFile => {
      let { codesDiplomes } = await parseCodesDiplomesFile(codesDiplomesFile);
      referentiel = codesDiplomes;

      return {
        errors: 0,
        total: codesDiplomes.length,
      };
    },
    findCodeEn: codeRNCP => {
      let found = referentiel.find(x => x.CodeRNCP === codeRNCP);
      return found ? found.CodeDiplome : null;
    },
    findCodeRNCP: codeEn => {
      let found = referentiel.find(x => x.CodeDiplome === codeEn);
      return found ? found.CodeRNCP : null;
    },
  };
};
