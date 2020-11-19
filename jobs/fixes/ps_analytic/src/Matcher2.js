const catalogue = require("./assets/formations_catalogue.json");

const matchingUAI = (matchType, ligne) => {
  const uai = catalogue =>
    catalogue.uai_formation === ligne.uai_gestionnaire ||
    catalogue.uai_formation === ligne.uai_composante ||
    catalogue.uai_formation === ligne.uai_affilie ||
    catalogue.etablissement_formateur_uai === ligne.uai_gestionnaire ||
    catalogue.etablissement_formateur_uai === ligne.uai_composante ||
    catalogue.etablissement_formateur_uai === ligne.uai_affilie ||
    catalogue.etablissement_responsable_uai === ligne.uai_gestionnaire ||
    catalogue.etablissement_responsable_uai === ligne.uai_composante ||
    catalogue.etablissement_responsable_uai === ligne.uai_affilie;

  const cp = catalogue =>
    catalogue.etablissement_responsable_code_postal === ligne.code_postal ||
    catalogue.code_postal === ligne.code_postal ||
    catalogue.etablissement_formateur_code_postal === ligne.code_postal;

  const insee = catalogue => catalogue.code_commune_insee === ligne.code_commune_insee;

  const academie = catalogue => catalogue.nom_academie === ligne.nom_academie;

  const cfd = catalogue => catalogue.educ_nat_code === ligne.code_cfd;

  const duo1 = catalogue =>
    catalogue.educ_nat_code === ligne.code_cfd && catalogue.num_departement === ligne.code_postal.substring(0, 2);

  const mef = catalogue => catalogue.mef_10_code === ligne.code_mef_10;

  // const duo2 =
  //   catalogue.educ_nat_code === ligne.CODECFD2 && catalogue.num_departement === ligne.code_postal.substring(0, 2);

  // const duo3 =
  //   catalogue.educ_nat_code === ligne.CODECFD3 && catalogue.num_departement === ligne.code_postal.substring(0, 2);

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
    catalogue.etablissement_responsable_code_postal === ligne.code_postal ||
    catalogue.code_postal === ligne.code_postal ||
    catalogue.etablissement_formateur_code_postal === ligne.code_postal;

  const insee = catalogue => catalogue.code_commune_insee === ligne.code_commune_insee;

  const academie = catalogue => catalogue.nom_academie === ligne.nom_academie;

  const cfd = catalogue => catalogue.educ_nat_code === ligne.code_cfd;

  const dept = catalogue => catalogue.num_departement === ligne.code_postal.substring(0, 2);

  const mef = catalogue => catalogue.mef_10_code === ligne.code_mef_10;

  // const duo2 =
  //   catalogue.educ_nat_code === ligne.CODECFD2 && catalogue.num_departement === ligne.code_postal.substring(0, 2);

  // const duo3 =
  //   catalogue.educ_nat_code === ligne.CODECFD3 && catalogue.num_departement === ligne.code_postal.substring(0, 2);

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
