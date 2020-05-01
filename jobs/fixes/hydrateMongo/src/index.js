// #region Imports
const asyncForEach = require("../../../common/utils").asyncForEach;
const { connectToMongo } = require("../../../../common/mongo");
const logger = require("../../../common/Logger").mainLogger;
const { Establishment, Formation } = require("../../../common/models");

const { getEtablissements, getFormations } = require("./services/elasticSearch");
const mapNewModelEtablishment = require("./mapNewModelEtablishment");
const mapNewModelFormation = require("./mapNewModelFormation");

// #endregion

const oldConfig = {
  dev: {
    elasticsearch: {
      region: "eu-west-3",
      endpoint: "search-mna-data-dev-v3qagyfodsnvctqajpv2gz2zta.eu-west-3.es.amazonaws.com",
    },
  },
  prod: {
    elasticsearch: {
      region: "eu-west-3",
      endpoint: "search-mna-data-prod-jc45wamu3zanoi7nnwamaowtjq.eu-west-3.es.amazonaws.com",
    },
  },
};

const ENV = process.env.STAGE || "dev";
const { endpoint: oldEsEndpoint, region: oldEsRegion } = oldConfig[ENV].elasticsearch;

const run = async () => {
  try {
    logger.info(" -- Hydrate MONGO -- ");
    await connectToMongo();

    const etablissements = await getEtablissements(oldEsEndpoint, oldEsRegion);
    await asyncForEach(etablissements, async item => {
      const { _source: etablissement } = item;

      const newEtablissement = mapNewModelEtablishment(etablissement);
      console.log(newEtablissement);
      const doc = new Establishment(newEtablissement);
      await doc.save();
    });

    const formations = await getFormations(oldEsEndpoint, oldEsRegion);
    await asyncForEach(formations, async item => {
      const { _source: formation } = item;

      const formateur = await Establishment.findOne({ siret: formation.siret_formateur });
      const responsable = await Establishment.findOne({ siret: formation.siret_CFA_OFA });

      const newFormation = mapNewModelFormation(formation, formateur, responsable);
      console.log(newFormation);

      const doc = new Formation(newFormation);
      await doc.save();
    });

    logger.info(" -- End Hydrate MONGO -- ");
  } catch (err) {
    logger.error(err);
  }
};

if (process.env.STAGE) {
  run();
}
