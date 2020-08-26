const geoController = require("../controllers/geoController");

const getDataFromCP = async providedCP => {
  if (!providedCP || !geoController.isValidCodePostal(providedCP.trim())) {
    return {
      result: {},
      messages: {
        error: "Le code  postal fourni doit être définit et au format 5 caractères",
      },
    };
  }

  let codePostal = `${providedCP}`.trim();

  const { info, value } = await geoController.findCode(codePostal);

  if (!value) {
    return {
      result: {},
      messages: {
        error: "Le code  postal fourni est introuvable",
      },
    };
  }

  const { nom_dept, nom_region, insee_com, code_dept, postal_code, nom_comm } = value;

  const nomAcademieUpdated = await geoController.findNomAcademie(code_dept);
  const numAcademieUpdated = await geoController.findNumAcademie(code_dept);

  return {
    result: {
      code_postal: postal_code,
      code_commune_insee: insee_com,
      commune: nom_comm,
      num_departement: code_dept,
      nom_departement: nom_dept,
      region: nom_region,
      nom_academie: nomAcademieUpdated.value,
      num_academie: numAcademieUpdated.value,
      //geo_coordonnees:cfdUpdated.value,
    },
    messages: {
      cp: info,
      nom_academie: nomAcademieUpdated.info,
      num_academie: numAcademieUpdated.info,
    },
  };
};
module.exports.getDataFromCP = getDataFromCP;

// Add GetGeo from Adresse
