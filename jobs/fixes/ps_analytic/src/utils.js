const axios = require("axios");
const fileManager = require("./FileManager");
const logger = require("../../../common-jobs/Logger").mainLogger;

const endpoint = "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

async function getMefInfo(mef) {
  try {
    const response = await axios.post(`https://tables-correspondances.apprentissage.beta.gouv.fr/api/mef`, {
      mef,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
module.exports.getMefInfo = getMefInfo;

async function getCfdInfo(cfd) {
  try {
    const response = await axios.post(`https://tables-correspondances.apprentissage.beta.gouv.fr/api/cfd`, {
      cfd,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
module.exports.getCfdInfo = getCfdInfo;

async function findFormationCatalogue(params) {
  try {
    const response = await axios.get(`https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod/formations`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
module.exports.findFormationCatalogue = findFormationCatalogue;

async function getEtablissements(options) {
  try {
    let { page, allEtablissements, limit, query } = { page: 1, allEtablissements: [], limit: 1050, ...options };

    let params = { page, limit, query };
    logger.debug(`Requesting ${endpoint}/etablissements with parameters`, params);
    const response = await axios.get(`${endpoint}/etablissements`, { params });

    const { etablissements, pagination } = response.data;
    allEtablissements = allEtablissements.concat(etablissements); // Should be properly exploded, function should be pure

    if (page < pagination.nombre_de_page) {
      return getEtablissements({ page: page + 1, allEtablissements, limit });
    } else {
      return allEtablissements;
    }
  } catch (error) {
    logger.error(error);
    return null;
  }
}
module.exports.getEtablissements = getEtablissements;

async function getFormations(options) {
  try {
    let { page, allFormations, limit } = { page: 1, allFormations: [], limit: 1050, ...options };

    let params = { page, limit };
    logger.info(`Requesting ${endpoint}/formations with parameters`, params);
    const response = await axios.get(`${endpoint}/formations`, { params });

    const { formations, pagination } = response.data;
    allFormations = allFormations.concat(formations); // Should be properly exploded, function should be pure

    if (page < pagination.nombre_de_page) {
      // if (page < 2) {
      return getFormations({ page: page + 1, allFormations });
    } else {
      return allFormations;
    }
  } catch (error) {
    logger.error(error);
    return null;
  }
}
module.exports.getFormations = getFormations;

async function sourceData() {
  const catalogue = await getEtablissements();
  await fileManager.createJson("etablissements_catalogue.json", catalogue);
  const formation = await getFormations();
  await fileManager.createJson("formations_catalogue.json", formation);
}
module.exports.sourceData = sourceData;
