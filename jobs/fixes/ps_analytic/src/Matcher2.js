const catalogue = require("./assets/formations_catalogue.json");

const matchingUAI = (matchType, ligne) => {
  const uai = catalogue =>
    catalogue.uai_formation === ligne.UAI_GES ||
    catalogue.uai_formation === ligne.UAI_COMPOSANTE ||
    catalogue.uai_formation === ligne.UAI_AFF ||
    catalogue.etablissement_formateur_uai === ligne.UAI_GES ||
    catalogue.etablissement_formateur_uai === ligne.UAI_COMPOSANTE ||
    catalogue.etablissement_formateur_uai === ligne.UAI_AFF ||
    catalogue.etablissement_responsable_uai === ligne.UAI_GES ||
    catalogue.etablissement_responsable_uai === ligne.UAI_COMPOSANTE ||
    catalogue.etablissement_responsable_uai === ligne.UAI_AFF;

  const cp = catalogue =>
    catalogue.etablissement_responsable_code_postal === ligne.CODEPOSTAL ||
    catalogue.code_postal === ligne.CODEPOSTAL ||
    catalogue.etablissement_formateur_code_postal === ligne.CODEPOSTAL;

  const insee = catalogue => catalogue.code_commune_insee === ligne.CODECOMMUNE;

  const academie = catalogue => catalogue.nom_academie === ligne.ACADEMIE;

  const cfd = catalogue => catalogue.educ_nat_code === ligne.CFD_VALEUR;

  const duo1 = catalogue =>
    catalogue.educ_nat_code === ligne.CFD_VALEUR && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  const mef = catalogue => catalogue.mef_10_code === ligne.CODEMEF;

  // const duo2 =
  //   catalogue.educ_nat_code === ligne.CODECFD2 && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  // const duo3 =
  //   catalogue.educ_nat_code === ligne.CODECFD3 && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  const filter = condition => catalogue.filter(catalogue => condition(catalogue));

  switch (matchType) {
    case "1":
      return filter(uai);
      break;
    case "2":
      return filter(i => uai(i) && duo1(i));
      break;
    case "3":
      return filter(i => uai(i) && cfd(i) && insee(i));
      break;
    case "4":
      return filter(i => uai(i) && cfd(i) && insee(i) && cp(i));
      break;
    case "5":
      return filter(i => uai(i) && cfd(i) && insee(i) && cp(i) && academie(i));
      break;
    case "6":
      return filter(i => uai(i) && cfd(i) && insee(i) && cp(i) && academie(i) && mef(i));
      break;
    default:
      break;
  }
};

const matchingCFD = (matchType, ligne) => {
  const cp = catalogue =>
    catalogue.etablissement_responsable_code_postal === ligne.CODEPOSTAL ||
    catalogue.code_postal === ligne.CODEPOSTAL ||
    catalogue.etablissement_formateur_code_postal === ligne.CODEPOSTAL;

  const insee = catalogue => catalogue.code_commune_insee === ligne.CODECOMMUNE;

  const academie = catalogue => catalogue.nom_academie === ligne.ACADEMIE;

  const cfd = catalogue => catalogue.educ_nat_code === ligne.CFD_VALEUR;

  const dept = catalogue => catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  const mef = catalogue => catalogue.mef_10_code === ligne.CODEMEF;

  // const duo2 =
  //   catalogue.educ_nat_code === ligne.CODECFD2 && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  // const duo3 =
  //   catalogue.educ_nat_code === ligne.CODECFD3 && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  const filter = condition => catalogue.filter(catalogue => condition(catalogue));

  switch (matchType) {
    case "1":
      return filter(cfd);
      break;
    case "2":
      return filter(i => cfd(i) && dept(i));
      break;
    case "3":
      return filter(i => cfd(i) && insee(i));
      break;
    case "4":
      return filter(i => cfd(i) && insee(i) && cp(i));
      break;
    case "5":
      return filter(i => cfd(i) && insee(i) && cp(i) && academie(i));
      break;
    case "6":
      return filter(i => cfd(i) && insee(i) && cp(i) && academie(i) && mef(i));
      break;
    default:
      break;
  }
};

let predicateUAI = [
  ligne => matchingUAI("1", ligne),
  ligne => matchingUAI("2", ligne),
  ligne => matchingUAI("3", ligne),
  ligne => matchingUAI("4", ligne),
  ligne => matchingUAI("5", ligne),
  ligne => matchingUAI("6", ligne),
];

let predicateCFD = [
  ligne => matchingCFD("1", ligne),
  ligne => matchingCFD("2", ligne),
  ligne => matchingCFD("3", ligne),
  ligne => matchingCFD("4", ligne),
  ligne => matchingCFD("5", ligne),
  ligne => matchingCFD("6", ligne),
];

function run(data) {
  let res = {
    formation: data,
    matching_uai: [],
    matching_cfd: [],
  };

  // TODO : request on CFD2_VALEUR & CFD3_VALEUR
  let resultsUAI = predicateUAI.map(p => p(data));
  resultsUAI.forEach((x, index) => {
    res.matching_uai.push({
      matching_strengh: index + 1,
      data_length: x.length,
      data: x,
    });
  });

  if (resultsUAI[0].length === 0) {
    let resultsCFD = predicateCFD.map(p => p(data));
    resultsCFD.forEach((x, index) => {
      res.matching_cfd.push({
        matching_strengh: index + 1,
        data_length: x.length,
        data: x,
      });
    });
  }

  return res;
}

module.exports = run;
