const wsRCO = require("./wsRCO");

class Importer {
  constructor() {}

  async run() {
    const rcoCatalogue = await wsRCO.getRCOcatalogue();
    console.log(rcoCatalogue);
  }
}

const importer = new Importer();
module.exports = importer;
