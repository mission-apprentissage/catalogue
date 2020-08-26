const { computeCodes } = require("./Constants");
const bcnChecker = require("./BcnChecker");

const getDataFromCdf = cdf => {
  if (!cdf) {
    return null;
  }
  const cdfTrimmed = `${cdf}`.trim();
  const cdfUpdated = bcnChecker.findCdf(cdfTrimmed);
  const niveauUpdated = bcnChecker.findNiveau(cdfUpdated.value);
  const intituleLongUpdated = bcnChecker.findIntituleLong(cdfUpdated.value);
  const intituleCourtUpdated = bcnChecker.findIntituleCourt(cdfUpdated.value);
  const diplomeUpdated = bcnChecker.findDiplome(cdfUpdated.value);

  const Mefs10List = bcnChecker.findMefs10(cdfUpdated.value);
  const Mefs10Updated = [];
  for (let i = 0; i < Mefs10List.value.length; i++) {
    const mef10 = Mefs10List.value[i];
    const modalite = bcnChecker.getModalities(mef10);
    Mefs10Updated.push({
      mef10,
      modalite,
    });
  }

  const Mefs8Updated = bcnChecker.findMefs8(cdfUpdated.value);

  return {
    result: {
      cdf: cdfUpdated.value,
      niveau: niveauUpdated.value,
      intitule_long: intituleLongUpdated.value,
      intitule_court: intituleCourtUpdated.value,
      diplome: diplomeUpdated.value,
      mefs10: Mefs10Updated,
      mefs8: Mefs8Updated.value,
    },
    messages: {
      cdf: computeCodes.cdf[cdfUpdated.info],
      niveau: computeCodes.niveau[niveauUpdated.info],
      intitule_long: computeCodes.intitule[intituleLongUpdated.info],
      intitule_court: computeCodes.intitule[intituleCourtUpdated.info],
      diplome: computeCodes.diplome[diplomeUpdated.info],
      mefs10: computeCodes.mef[Mefs10List.info],
      mefs8: computeCodes.mef[Mefs8Updated.info],
    },
  };
};

module.exports.getDataFromCdf = getDataFromCdf;

const run = async (
  options = {
    mode: "cdf_info",
    value: "XXXX",
  }
) => {
  try {
    if (options.mode === "cdf_info") {
      const response = getDataFromCdf(options.value);
      console.log(response);
    } else if (options.mode === "cdf_speciality") {
      const response = bcnChecker.getSpeciality(options.value);
      console.log(response);
    } else if (options.mode === "mef_modalite") {
      const response = bcnChecker.getModalities(options.value);
      console.log(response);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.run = run;

run({
  mode: "cdf_info",
  value: "32321014",
});

// run({
//   mode: "mef_modalite",
//   value: "3712101422",
// });

// run({
//   mode: "cdf_speciality",
//   value: "T",
// });
