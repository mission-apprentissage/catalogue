const asyncForEach = require("../../../../../common-jobs/utils").asyncForEach;
const fileManager = require("./FileManager");
const axios = require("axios");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

class RcoChecker {
  constructor() {
    this.formations = fileManager.getFile();
  }

  async run() {
    // const responseRNCP = await this.getRNCPInfo(`RNCP34777`);
    // console.log(responseRNCP);
    const results = [];
    await asyncForEach(this.formations, async formation => {
      let resultCFd = {
        message: "",
        valeur: "",
      };
      let resultRNCP = {
        message: "",
        valeur: "",
      };
      if (formation.cfd) {
        const responseCFD = await this.getCfdInfo(formation.cfd);
        if (responseCFD) {
          switch (responseCFD.messages.cfd) {
            case "Non trouvé base N_FORMATION_DIPLOME, Trouvé base V_FORMATION_DIPLOME":
            case "Trouvé base N_FORMATION_DIPLOME":
              resultCFd.message = "Ok";
              break;
            case "Mis à jour base N_FORMATION_DIPLOME":
              // MAJ
              resultCFd.message = responseCFD.messages.cfd;
              resultCFd.valeur = `${responseCFD.result.cfd} => ${responseCFD.result.rncp.cfd}`;
              break;
            case "Non trouvé base N_FORMATION_DIPLOME, Périmé base V_FORMATION_DIPLOME":
            case "Périmé base N_FORMATION_DIPLOME":
              // Outdated
              resultCFd.message = responseCFD.messages.cfd;
              resultCFd.valeur = `${responseCFD.result.cfd} => ${responseCFD.result.rncp.cfd}`;
              break;
            case undefined:
              // ERREUR DE FORMAT
              resultCFd.message = responseCFD.messages.error;
              break;
            default:
              console.log(responseCFD);
              break;
          }

          if (`RNCP${formation.rncp_code}` !== responseCFD.result.rncp.code_rncp) {
            resultRNCP.message = "Le code RNCP associé est éronné";
            resultRNCP.valeur = `${formation.rncp_code} => ${responseCFD.result.rncp.code_rncp}`;
          } else {
            resultRNCP.message = "Ok";
          }
        }
      } else if (formation.rncp_code) {
        const responseRNCP = await this.getRNCPInfo(`RNCP${formation.rncp_code}`);
        if (responseRNCP) {
          if (responseRNCP.messages.code_rncp === "Non trouvé") {
            resultRNCP.message = "Le code RNCP Non trouvé";
          } else {
            resultCFd.message = responseRNCP.messages.cfd.cfd;
            resultCFd.valeur = responseRNCP.result.cfd.cfd;
          }
        } else {
          console.log(responseRNCP);
        }
      } else {
        resultCFd = {
          message: "Erreur",
          valeur: "",
        };
        resultRNCP = {
          message: "Erreur",
          valeur: "",
        };
      }

      results.push({
        etablissement_gestionnaire_siret: formation.etablissement_gestionnaire_siret | "",
        etablissement_gestionnaire_adresse: formation.etablissement_gestionnaire_adresse
          ? formation.etablissement_gestionnaire_adresse.replace(/\n/g, " ")
          : "",
        etablissement_gestionnaire_code_postal: formation.etablissement_gestionnaire_code_postal | "",
        etablissement_gestionnaire_code_insee: formation.etablissement_gestionnaire_code_insee | "",
        etablissement_formateur_siret: formation.etablissement_formateur_siret | "",
        etablissement_formateur_adresse: formation.etablissement_formateur_adresse
          ? formation.etablissement_formateur_adresse.replace(/\n/g, " ")
          : "",
        etablissement_formateur_code_postal: formation.etablissement_formateur_code_postal | "",
        etablissement_formateur_code_insee: formation.etablissement_formateur_code_insee | "",
        etablissement_lieu_formation_adresse: formation.etablissement_lieu_formation_adresse
          ? formation.etablissement_lieu_formation_adresse.replace(/\n/g, " ")
          : "",
        etablissement_lieu_formation_code_postal: formation.etablissement_lieu_formation_code_postal | "",
        etablissement_lieu_formation_code_insee: formation.etablissement_lieu_formation_code_insee | "",
        cfd: formation.cfd | "",
        rncp_code: formation.rncp_code | "",
        debut_sessions: formation.debut_sessions | "",

        cdf_statut: resultCFd.message,
        cfd_valeur: resultCFd.valeur,
        rncp_statut: resultCFd.message,
        rncp_valeur: resultCFd.valeur,
      });
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const fields = [
      "etablissement_gestionnaire_siret",
      "etablissement_gestionnaire_adresse",
      "etablissement_gestionnaire_code_postal",
      "etablissement_gestionnaire_code_insee",
      "etablissement_formateur_siret",
      "etablissement_formateur_adresse",
      "etablissement_formateur_code_postal",
      "etablissement_formateur_code_insee",
      "etablissement_lieu_formation_adresse",
      "etablissement_lieu_formation_code_postal",
      "etablissement_lieu_formation_code_insee",
      "cfd",
      "rncp_code",
      "debut_sessions",
      "cdf_statut",
      "cfd_valeur",
      "rncp_statut",
      "rncp_valeur",
    ];
    const opts = { fields, delimiter: ";" };

    try {
      const parser = new Parser(opts);
      const csv = parser.parse(results);
      fs.writeFileSync(path.join(__dirname, "../../../output.csv"), csv);
    } catch (err) {
      console.error(err);
    }
  }

  async getCfdInfo(cfd) {
    try {
      const response = await axios.post(`https://tables-correspondances-recette.apprentissage.beta.gouv.fr/api/cfd`, {
        cfd,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getRNCPInfo(rncp) {
    try {
      const response = await axios.post(`https://tables-correspondances-recette.apprentissage.beta.gouv.fr/api/rncp`, {
        //const response = await axios.post(`http://localhost/api/rncp`, {
        rncp,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

const rcoChecker = new RcoChecker();
module.exports = rcoChecker;
