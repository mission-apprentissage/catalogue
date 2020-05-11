const { connectToMongo } = require("../../../../common/mongo");
const { Formation, Establishment } = require("../../../common-jobs/models");
const logger = require("../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const pSupData = require("./updaters/pSupData");
const pSupChecker = require("./updaters/pSupData/pSupChecker");
const { uniq } = require("lodash");

const UPDATE_ALL = true;
const UPDATE_ONLY = { attr: "ds_id_dossier", value: "1202774" };

const run = async () => {
  try {
    logger.info(" -- Start of Trainings updater -- ");
    await connectToMongo();

    const trainings = await Formation.find({ parcoursup_reference: "NON" }).and([
      { educ_nat_code: { $ne: null } },
      { educ_nat_code: { $ne: "" } },
      { intitule_long: { $ne: null } },
      { intitule_long: { $ne: "" } },
      { intitule_court: { $ne: null } },
      { intitule_court: { $ne: "" } },
      { niveau: { $ne: null } },
      { niveau: { $ne: "" } },
    ]);

    //console.log(trainings.length);
    const formationsToload = trainings.filter(trainingItem => {
      if (
        trainingItem._doc.niveau === "4 (Bac...)" ||
        trainingItem._doc.niveau === "5 (BTS, DUT...)" ||
        trainingItem._doc.niveau === "6 (Licence...)"
      ) {
        if (
          trainingItem._doc.etablissement_formateur_uai !== null ||
          trainingItem._doc.etablissement_responsable_uai !== null ||
          trainingItem._doc.uai_formation !== null
        ) {
          if (
            trainingItem._doc.etablissement_formateur_conventionne === "OUI" ||
            (trainingItem._doc.etablissement_reference_declare_prefecture === "OUI" &&
              trainingItem._doc.etablissement_reference_datadock === "datadocké")
          ) {
            // GROUPE 1  ON EST QUE CES FORMATIONS ENTRENT
            return true;
          } else if (
            trainingItem._doc.rncp_eligible_apprentissage &&
            (trainingItem._doc.rncp_etablissement_formateur_habilite ||
              trainingItem._doc.rncp_etablissement_responsable_habilite)
          ) {
            // CHECK RNCP
            return true;
          }
        }
      }

      return false;
    });
    console.log(formationsToload.length);

    for (let i = 0; i < formationsToload.length; i++) {
      formationsToload[i]._doc.parcoursup_a_charger = true;
    }

    let allUais = [];
    for (let i = 0; i < formationsToload.length; i++) {
      const { etablissement_formateur_uai, etablissement_responsable_uai, uai_formation } = formationsToload[i]._doc;
      const uaiEF = etablissement_formateur_uai ? pSupChecker.isUaiExist(etablissement_formateur_uai.trim()) : true;
      const uaiER = etablissement_responsable_uai ? pSupChecker.isUaiExist(etablissement_responsable_uai.trim()) : true;
      const uaiF = uai_formation ? pSupChecker.isUaiExist(uai_formation.trim()) : true;

      const uaisToAdd = [];
      if (!uaiEF) {
        uaisToAdd.push(etablissement_formateur_uai.trim());
      }
      if (!uaiER) {
        uaisToAdd.push(etablissement_responsable_uai.trim());
      }
      if (!uaiF) {
        uaisToAdd.push(uai_formation.trim());
      }
      allUais = [...allUais, ...uaisToAdd];
    }
    //console.log(allUais.length);
    allUais = uniq(allUais);
    //console.log(allUais.length);

    const multipleEtablishment = [];
    const establishmentsToAdd = [];
    await asyncForEach(allUais, async uai => {
      const etablishment = await Establishment.find({ uai });
      if (etablishment.length > 1) multipleEtablishment.push(uai);
      else if (etablishment.length === 1 && !etablishment.ferme) {
        etablishment.parcoursup_a_charger = true;
        establishmentsToAdd.push(etablishment);
      }
    });
    console.log(establishmentsToAdd.length);
    console.log(`multiple ${multipleEtablishment.length}`);

    pSupData.stats();

    logger.info(" -- End of Trainings updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
