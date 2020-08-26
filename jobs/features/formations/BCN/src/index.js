const { computeCodes, infosCodes } = require("./Constants");
const bcnChecker = require("./BcnChecker");

const getDataFromCfd = providedCfd => {
  if (!providedCfd || !/^[0-9]{8}[A-Z]?$/g.test(providedCfd)) {
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
      ? bcnChecker.getSpeciality(providedCfd.substring(8, 9))
      : { info: infosCodes.specialite.Error, value: null };

  const cfdUpdated = bcnChecker.findCfd(cfd);
  const niveauUpdated = bcnChecker.findNiveau(cfdUpdated.value);
  const intituleLongUpdated = bcnChecker.findIntituleLong(cfdUpdated.value);
  const intituleCourtUpdated = bcnChecker.findIntituleCourt(cfdUpdated.value);
  const diplomeUpdated = bcnChecker.findDiplome(cfdUpdated.value);

  const Mefs10List = bcnChecker.findMefs10(cfdUpdated.value);
  const Mefs10Updated = [];
  for (let i = 0; i < Mefs10List.value.length; i++) {
    const mef10 = Mefs10List.value[i];
    const modalite = bcnChecker.getModalities(mef10);
    Mefs10Updated.push({
      mef10,
      modalite,
    });
  }

  const Mefs8Updated = bcnChecker.findMefs8(cfdUpdated.value);

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

const getModaliteFromMef10 = providedMef10 => {
  return bcnChecker.getModalities(providedMef10);
};
module.exports.getModaliteFromMef10 = getModaliteFromMef10;

//////////////////////////////////////////////////////////////////////////////////////////

const run = async (
  options = {
    mode: "cfd_info",
    value: "XXXX",
  }
) => {
  try {
    if (options.mode === "cfd_info") {
      return getDataFromCfd(options.value);
    } else if (options.mode === "mef_modalite") {
      return getModaliteFromMef10(options.value);
    }
  } catch (error) {
    console.log(error);
    return {
      result: {},
      messages: {
        error: error.message,
      },
    };
  }
};

module.exports.run = run;
