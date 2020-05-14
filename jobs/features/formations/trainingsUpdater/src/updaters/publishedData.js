//const logger = require("../../../../../common-jobs/Logger").mainLogger;

class PublishedData {
  constructor() {}

  async getUpdates(training) {
    let published = true;
    // etablissement_responsable_id
    // etablissement_formateur_id
    // etablissement_formateur_published
    // etablissement_responsable_published
    if (!training.etablissement_reference_published) {
      published = false;
    }
    return {
      published,
    };
  }
}

const publishedData = new PublishedData();
module.exports = publishedData;
