const { getS3ObjectAsStream } = require("../awsS3");
const createReferentiel = require("./referentiel");

class ReferentielGeographique {
  constructor() {
    this.inputStream = getS3ObjectAsStream("mna-services/fr-esr-referentiel-geographique.csv");
  }

  async importReferentiel() {
    this.referentiel = createReferentiel();
    await this.referentiel.loadCsvFile(this.inputStream);
  }
}

const referentielGeographique = new ReferentielGeographique();
module.exports = referentielGeographique;
