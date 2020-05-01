const { pipeline, writeObject } = require("../../../../../common/streamUtils");
const logger = require("../../../../common-jobs/Logger").mainLogger;
const { Establishment } = require("../../../../common-jobs/models");
const sanitizeUAI = require("./sanitizeUAI");

module.exports = async (options = {}) => {
  let stats = {
    updated: 0,
    total: 0,
    errors: 0,
  };

  await pipeline(
    Establishment.find(options.query ? options.query : {}).cursor(),
    writeObject(
      async establishment => {
        try {
          let ds_questions_uai = establishment.ds_questions_uai
            ? sanitizeUAI(establishment.ds_questions_uai)
            : establishment.ds_questions_uai;
          let uai = establishment.uai ? sanitizeUAI(establishment.uai) : establishment.uai;

          if (uai !== establishment.uai || ds_questions_uai !== establishment.ds_questions_uai) {
            establishment.ds_questions_uai = sanitizeUAI(establishment.ds_questions_uai);
            establishment.uai = sanitizeUAI(establishment.uai);

            await establishment.save();

            stats.updated++;
            logger.info(`Establishment ${establishment._id} has been updated`);
          }

          stats.total++;
        } catch (e) {
          stats.errors++;
          logger.error(e);
        }
      },
      { parallel: 25 }
    )
  );

  return stats;
};
