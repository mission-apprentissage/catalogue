const { connectToMongo } = require("../../../../common/mongo");
const { Formation, Establishment } = require("../../../common-jobs/models");
const logger = require("../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const affelnetChecker = require("./updaters/affelnetData/affelnetChecker");
const { uniq } = require("lodash");

//const UPDATE_ALL = true;
//const UPDATE_ONLY = { attr: "ds_id_dossier", value: "1202774" };

const run = async () => {
  try {
    logger.info(" -- Start of Afflenet updater -- ");
    await connectToMongo();

    const trainings = await Formation.find({ affelnet_reference: "Non trouvé" }).and([
      { educ_nat_code: { $ne: null } },
      { educ_nat_code: { $ne: "" } },
      { intitule_long: { $ne: null } },
      { intitule_long: { $ne: "" } },
      { intitule_court: { $ne: null } },
      { intitule_court: { $ne: "" } },
      { niveau: { $ne: null } },
      { niveau: { $ne: "" } },
    ]);
    let countRNCPhabiliteDiff = 0;
    //console.log(trainings.length);
    const formationsToload = trainings.filter(trainingItem => {
      if (
        trainingItem._doc.diplome !== "AUTRES DIPLOMES DE NIVEAU IV" &&
        trainingItem._doc.diplome !== "AUTRES DIPLOMES DE NIVEAU V" &&
        trainingItem._doc.diplome !== "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU IV" &&
        trainingItem._doc.diplome !== "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 4" &&
        trainingItem._doc.diplome !== "BREVET PROFESSIONNEL" &&
        trainingItem._doc.diplome !== "CERTIFICAT DE SPECIALISATION AGRICOLE DE NIVEAU 5" &&
        trainingItem._doc.diplome !== "MENTION COMPLEMENTAIRE" &&
        trainingItem._doc.diplome !== "BREVET DES METIERS D'ART - BREVET DES METIERS DU SPECTACLE" &&
        trainingItem._doc.diplome !== "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V" &&
        trainingItem._doc.diplome !== "BREVET D'ETUDES PROFESSIONNELLES" &&
        trainingItem._doc.diplome !== "BREVET D'ETUDES PROFESSIONNELLES AGRICOLES" &&
        trainingItem._doc.diplome !== "BAC TECHNOLOGIQUE"
      ) {
        if (trainingItem._doc.niveau === "3 (CAP...)" || trainingItem._doc.niveau === "4 (Bac...)") {
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
            } else {
              if (
                trainingItem._doc.rncp_eligible_apprentissage &&
                trainingItem._doc.rncp_etablissement_formateur_habilite !==
                  trainingItem._doc.rncp_etablissement_responsable_habilite
              ) {
                countRNCPhabiliteDiff++;
              }
              if (
                trainingItem._doc.rncp_eligible_apprentissage &&
                (trainingItem._doc.rncp_etablissement_formateur_habilite ||
                  trainingItem._doc.rncp_etablissement_responsable_habilite)
              ) {
                // CHECK RNCP
                return true;
              }
            }
          }
        }
      }

      return false;
    });
    console.log(formationsToload.length);
    console.log(`Diff Rncp habilité ${countRNCPhabiliteDiff}`);

    await asyncForEach(formationsToload, async trainingItem => {
      let updatedTraining = {
        ...trainingItem._doc,
      };
      updatedTraining.affelnet_a_charger = true;
      updatedTraining.last_update_at = Date.now();
      await Formation.findOneAndUpdate({ _id: trainingItem._id }, updatedTraining, { new: true });
      logger.info(`Training ${trainingItem._id} has been updated`);
    });

    let allUais = [];
    for (let i = 0; i < formationsToload.length; i++) {
      const { etablissement_formateur_uai, etablissement_responsable_uai, uai_formation } = formationsToload[i]._doc;
      const uaiEF = etablissement_formateur_uai ? affelnetChecker.isUaiExist(etablissement_formateur_uai.trim()) : true;
      const uaiER = etablissement_responsable_uai
        ? affelnetChecker.isUaiExist(etablissement_responsable_uai.trim())
        : true;
      const uaiF = uai_formation ? affelnetChecker.isUaiExist(uai_formation.trim()) : true;

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

    let establishmentsToAdd = new Map();
    await asyncForEach(allUais, async uai => {
      const etablishments = await Establishment.find({ uai });
      if (etablishments.length > 1) {
        for (let i = 0; i < etablishments.length; i++) {
          const establishmentToAdd = etablishments[i];
          if (!establishmentToAdd.ferme) {
            if (
              establishmentToAdd.computed_conventionne === "OUI" ||
              (establishmentToAdd.computed_declare_prefecture === "OUI" &&
                establishmentToAdd.computed_info_datadock === "datadocké")
            ) {
              establishmentToAdd.affelnet_a_charger = true;
              establishmentsToAdd.set(establishmentToAdd._id, establishmentToAdd);
            }
          }
        }
      } else if (etablishments.length === 1 && !etablishments[0].ferme) {
        const establishmentToAdd = etablishments[0];
        if (
          establishmentToAdd.computed_conventionne === "OUI" ||
          (establishmentToAdd.computed_declare_prefecture === "OUI" &&
            establishmentToAdd.computed_info_datadock === "datadocké")
        ) {
          establishmentToAdd.affelnet_a_charger = true;
          establishmentsToAdd.set(establishmentToAdd._id, establishmentToAdd);
        }
      }
    });

    console.log(establishmentsToAdd.size);
    establishmentsToAdd = Array.from(establishmentsToAdd.values());
    await asyncForEach(establishmentsToAdd, async establishmentToAdd => {
      // Update establishment
      establishmentToAdd.last_update_at = Date.now();
      await Establishment.findOneAndUpdate({ _id: establishmentToAdd._id }, establishmentToAdd, {
        new: true,
      });
      logger.info(`Establishment ${establishmentToAdd._id} has been updated`);
    });

    logger.info(" -- End of Afflenet updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
