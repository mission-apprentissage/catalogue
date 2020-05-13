//const logger = require("../../../../../common-jobs/Logger").mainLogger;

class PublishedData {
  constructor() {}

  async getUpdates(establishment) {
    let published = true;
    if (establishment.ferme || !establishment.formations_attachees || !establishment.api_entreprise_reference) {
      published = false;
    }
    return {
      published,
    };
  }
}

const publishedData = new PublishedData();
module.exports = publishedData;
