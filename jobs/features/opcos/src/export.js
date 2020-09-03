const logger = require("../../../common-jobs/Logger").mainLogger;
const { connectToMongo, closeMongoConnection } = require("../../../../common/mongo");
const { Formation, Establishment } = require("../../../../common/models2");
const { toXlsx } = require("./utils/exporter");
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;

const run = async () => {
  try {
    await connectToMongo();
    const opcoToSearch = "OPCO entreprises de proximité";
    await exportDataForOpco(opcoToSearch, "dataForOpcoEP");
    closeMongoConnection();
  } catch (err) {
    logger.error(err);
  }
};

const exportDataForOpco = async (opcoName, exportFileName) => {
  logger.info(" -- Export of OPCOs Data -- ");
  const dataForOpco = [];
  const formationsForOpco = await Formation.find({ opcos: `${opcoName}` });

  await asyncForEach(formationsForOpco, async formation => {
    const etablissement = await Establishment.findById(formation.etablissement_formateur_id);
    if (etablissement) {
      dataForOpco.push({
        codeDiplome: formation.educ_nat_code,
        intitule: formation.intitule_long,
        siret: etablissement.siret,
        code_naf: etablissement.naf_code,
        libelle_naf: etablissement.naf_libelle,
        enseigne: etablissement.enseigne,
        localite: etablissement.localite,
        region_implantation_nom: etablissement.region_implantation_nom,
      });
    }
  });

  // Export to xlsx
  await toXlsx(dataForOpco, "./output", `${exportFileName}.xlsx`, exportFileName, {});
  await logger.info(" -- End Stats of OPCO Export -- ");
};

run();
