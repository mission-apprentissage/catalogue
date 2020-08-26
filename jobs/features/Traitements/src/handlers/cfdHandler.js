const { computeCodes, infosCodes } = require("../controllers/bcn/Constants");
const bcnController = require("../controllers/bcn/bcnController");

const getDataFromCfd = providedCfd => {
  if (!providedCfd || !/^[0-9A-Z]{8}[A-Z]?$/g.test(providedCfd.trim())) {
    return {
      result: {},
      messages: {
        error: "Le code formation dilpome doit être définit et au format 8 caractères ou 9 avec la lettre specialité",
      },
    };
  }

  let cfd = providedCfd.length === 9 ? providedCfd.substring(0, 8) : providedCfd;
  cfd = `${cfd}`.trim();

  const specialiteUpdated =
    providedCfd.length === 9
      ? bcnController.getSpeciality(providedCfd.substring(8, 9))
      : { info: infosCodes.specialite.NotProvided, value: null };

  const cfdUpdated = bcnController.findCfd(cfd);
  const niveauUpdated = bcnController.findNiveau(cfdUpdated.value);
  const intituleLongUpdated = bcnController.findIntituleLong(cfdUpdated.value);
  const intituleCourtUpdated = bcnController.findIntituleCourt(cfdUpdated.value);
  const diplomeUpdated = bcnController.findDiplome(cfdUpdated.value);

  const Mefs10List = bcnController.findMefs10(cfdUpdated.value);
  const Mefs10Updated = [];
  for (let i = 0; i < Mefs10List.value.length; i++) {
    const mef10 = Mefs10List.value[i];
    const modalite = bcnController.getModalities(mef10);
    Mefs10Updated.push({
      mef10,
      modalite,
    });
  }

  const Mefs8Updated = bcnController.findMefs8(cfdUpdated.value);

  return {
    result: {
      cfd: cfdUpdated.value,
      specialite: specialiteUpdated.value,
      niveau: niveauUpdated.value,
      intitule_long: intituleLongUpdated.value,
      intitule_court: intituleCourtUpdated.value,
      diplome: diplomeUpdated.value,
      mefs10: Mefs10Updated,
      mefs8: Mefs8Updated.value,
    },
    messages: {
      cfd: computeCodes.cfd[cfdUpdated.info],
      specialite: computeCodes.specialite[specialiteUpdated.info],
      niveau: computeCodes.niveau[niveauUpdated.info],
      intitule_long: computeCodes.intitule[intituleLongUpdated.info],
      intitule_court: computeCodes.intitule[intituleCourtUpdated.info],
      diplome: computeCodes.diplome[diplomeUpdated.info],
      mefs10: computeCodes.mef[Mefs10List.info],
      mefs8: computeCodes.mef[Mefs8Updated.info],
    },
  };
};
module.exports.getDataFromCfd = getDataFromCfd;
