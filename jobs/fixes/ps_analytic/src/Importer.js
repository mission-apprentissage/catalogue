// #region Imports
const { connectToMongo } = require("../../../../common/mongo");
const logger = require("../../../common-jobs/Logger").mainLogger;
const { getMefInfo } = require("./utils");

const { PsFormations } = require("../../../common-jobs/models");
const { asyncForEach } = require("../../../common-jobs/utils");

const fileManager = require("./FileManager");

const run = async () => {
  try {
    logger.info(" -- Start database import -- ");
    await connectToMongo();

    const data = fileManager.getXLSXFile();
    console.log(data);

    asyncForEach(data, async formation => {
      if (!formation.code_cfd && formation.code_mef_10) {
        const responseMEF = await getMefInfo(formation.code_mef_10);
        if (responseMEF) {
          if (!responseMEF.messages.cfdUpdated === "Non trouvé") {
            formation.code_cfd = responseMEF.result.cfd.cfd;
          }
        }
      }

      logger.info(`Add ${formation.LIB_AFF} — ${formation.CODEMEF} to DB`);
      await PsFormations.create({
        uai_gestionnaire: formation.UAI_GES,
        uai_composante: formation.UAI_COMPOSANTE,
        libelle_uai_composante: formation.LIB_COMPOSANTE,
        uai_affilie: formation.UAI_AFF,
        libelle_uai_affilie: formation.LIB_AFF,
        code_commune_insee: formation.CODECOMMUNE,
        libelle_commune: formation.LIBCOMMUNE,
        code_postal: formation.CODEPOSTAL,
        nom_academie: formation.ACADEMIE,
        code_ministere: formation.MINISTERETUTELLE,
        libelle_ministere: formation.LIBMINISTERE,
        type_etablissement: formation.TYPEETA,
        code_formation: formation.CODEFORMATION,
        libelle_formation: formation.LIBFORMATION,
        code_specialite: formation.CODESPECIALITE,
        libelle_specialite: formation.LIBSPECIALITE,
        code_formation_initiale: formation.CODESPEFORMATIONINITIALE,
        code_mef_10: formation.CODEMEF,
        code_cfd: formation.CODECFD,
        code_cfd_2: formation.CODECFD2,
        code_cfd_3: formation.CODECFD3,
      });
    });

    logger.info(" -- End database import -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
