const referentiel = require("./rncp/referentiel");
const { pipeline, writeObject } = require("../../../common/script/streamUtils");
const logger = require("../../../common/Logger").mainLogger;
const { Formation } = require("../../../common/models");

module.exports = async (fichesFile, codesDiplomesFile, options = {}) => {
  let { buildReferentiel, getCodeRNCP, isHabilite, isEligibleApprentissage, getCodesROME } = referentiel(
    fichesFile,
    codesDiplomesFile
  );
  let stats = {
    formations: {
      updated: 0,
      errors: 0,
    },
    referentiel: 0,
  };

  logger.info("Loading RNCP referentiel (Fiches + Code Diplômes)...");
  stats.referentiel = await buildReferentiel();

  logger.info("Updating formations...");
  await pipeline(
    Formation.find(options.query ? options.query : {}).cursor(),
    writeObject(
      async f => {
        let codeRNCP = getCodeRNCP(f.educ_nat_code);
        let etablissement_reference_siret = f[`etablissement_${f.etablissement_reference}_siret`];

        try {
          f.rncp_code = codeRNCP;
          f.rome_codes = getCodesROME(codeRNCP);
          f.rncp_eligible_apprentissage = isEligibleApprentissage(codeRNCP);
          f.rncp_etablissement_formateur_habilite = isHabilite(codeRNCP, f.etablissement_formateur_siret);
          f.rncp_etablissement_responsable_habilite = isHabilite(codeRNCP, f.etablissement_responsable_siret);
          f.rncp_etablissement_reference_habilite = isHabilite(codeRNCP, etablissement_reference_siret);
          await f.save();
          stats.formations.updated++;
        } catch (e) {
          stats.formations.errors++;
          logger.error(e);
        }
      },
      { parallel: 5 }
    )
  );

  return stats;
};
