//const logger = require("../../../../../common-jobs/Logger").mainLogger;

class PublishedData {
  constructor() {}

  async getUpdates(establishment) {
    return {
      published: establishment.formations_attachees || establishment.api_entreprise_reference,
    };
  }
}

const publishedData = new PublishedData();
module.exports = publishedData;
