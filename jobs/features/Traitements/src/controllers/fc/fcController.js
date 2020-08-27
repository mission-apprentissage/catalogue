const createReferentiel = require("./referentielCodesDiplomesRncp");
const path = require("path");

class FcController {
  constructor() {
    this.referentiel = createReferentiel();
    const codeDiplomesFile = path.join(__dirname, "../../assets", "codes_diplomes.v1.2.csv");
    this.referentiel.load(codeDiplomesFile);
  }

  findCfdFromRncp(rncp_code) {
    const educ_nat_code = this.referentiel.findCodeEn(rncp_code);
    return { info: !educ_nat_code ? "Non trouvé" : "Ok", value: educ_nat_code };
  }

  findRncpFromCfd(educ_nat_code) {
    const rncp_code = this.referentiel.findCodeRNCP(educ_nat_code);
    return { info: !rncp_code ? "Non trouvé" : "Ok", value: rncp_code };
  }
}

const fcController = new FcController();
module.exports = fcController;
