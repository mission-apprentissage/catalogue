// #region Imports
const { connectToMongo } = require("../../../../common/mongo");
const logger = require("../../../common-jobs/Logger").mainLogger;

const { PsFormations } = require("../../../common-jobs/models");
const { asyncForEach } = require("../../../common-jobs/utils");

const fileManager = require("./FileManager");

const run = async () => {
  try {
    logger.info(" -- Start _TEMPLATE -- ");
    await connectToMongo();

    const data = fileManager.getXLSXFile();
    console.log(data);

    asyncForEach(data, async item => {
      logger.info(`Add ${item.LIB_AFF} — ${item.CODEMEF}`);
      await PsFormations.create({
        uai_gestionnaire: item.UAI_GES,
        uai_composante: item.UAI_COMPOSANTE,
        libelle_uai_composante: item.LIB_COMPOSANTE,
        uai_affilie: item.UAI_AFF,
        libelle_uai_affilie: item.LIB_AFF,
        code_commune_insee: item.CODECOMMUNE,
        libelle_commune: item.LIBCOMMUNE,
        code_postal: item.CODEPOSTAL,
        nom_academie: item.ACADEMIE,
        code_ministere: item.MINISTERETUTELLE,
        libelle_ministere: item.LIBMINISTERE,
        type_etablissement: item.TYPEETA,
        code_formation: item.CODEFORMATION,
        libelle_formation: item.LIBFORMATION,
        code_specialite: item.CODESPECIALITE,
        libelle_specialite: item.LIBSPECIALITE,
        code_formation_initiale: item.CODESPEFORMATIONINITIALE,
        code_mef_10: item.CODEMEF,
        code_cfd: item.CODECFD,
        code_cfd_2: item.CODECFD2,
        code_cfd_3: item.CODECFD3,
      });
      logger.info(`Done`);
    });

    logger.info(" -- End _TEMPLATE -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
