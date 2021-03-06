const asyncForEach = require("../../../../../common-jobs/utils").asyncForEach;
const fileManager = require("./FileManager");
const Exporter = require("./Exporter");
const axios = require("axios");

class RcoChecker {
  constructor() {
    this.formations = fileManager.getXLSXFile();
  }

  async run() {
    // const responseRNCP = await this.getRNCPInfo(`RNCP34777`);
    // console.log(responseRNCP);
    const results = [];
    console.log(this.formations.length);

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

          if (!formation.rncp_code) {
            if (!responseCFD.result.rncp.code_rncp) {
              resultRNCP.message = "Le code RNCP Vide et aucune correspondance n'est retrouvée";
            } else {
              resultRNCP.message = "Le code RNCP Vide";
              if (responseCFD.result.rncp.code_rncp === "NR") {
                resultRNCP.valeur = `le CFD ${responseCFD.messages.cfd} n'est pas encore répertorié par FC`;
              } else {
                resultRNCP.valeur = `${responseCFD.result.rncp.code_rncp}`;
              }
            }
          } else if (`RNCP${formation.rncp_code}` !== responseCFD.result.rncp.code_rncp) {
            resultRNCP.message = "Le code RNCP associé est éronné";
            if (responseCFD.result.rncp.code_rncp === "NR") {
              resultRNCP.valeur = `le CFD ${responseCFD.messages.cfd} n'est pas encore répertorié par FC (RNCP${formation.rncp_code} n'est pas correct)`;
            } else {
              if (responseCFD.result.rncp.code_rncp) {
                resultRNCP.valeur = `RNCP${formation.rncp_code} => ${responseCFD.result.rncp.code_rncp}`;
              }
            }
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
            resultRNCP.message = "Ok";
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
        etablissement_gestionnaire_siret: formation.etablissement_gestionnaire_siret || "",
        etablissement_gestionnaire_adresse: formation.etablissement_gestionnaire_adresse
          ? formation.etablissement_gestionnaire_adresse.replace(/\n/g, " ")
          : "",
        etablissement_gestionnaire_code_postal: formation.etablissement_gestionnaire_code_postal || "",
        etablissement_gestionnaire_code_insee: formation.etablissement_gestionnaire_code_insee || "",
        etablissement_formateur_siret: formation.etablissement_formateur_siret || "",
        etablissement_formateur_adresse: formation.etablissement_formateur_adresse
          ? formation.etablissement_formateur_adresse.replace(/\n/g, " ")
          : "",
        etablissement_formateur_code_postal: formation.etablissement_formateur_code_postal || "",
        etablissement_formateur_code_insee: formation.etablissement_formateur_code_insee || "",
        etablissement_lieu_formation_adresse: formation.etablissement_lieu_formation_adresse
          ? formation.etablissement_lieu_formation_adresse.replace(/\n/g, " ")
          : "",
        etablissement_lieu_formation_code_postal: formation.etablissement_lieu_formation_code_postal || "",
        etablissement_lieu_formation_code_insee: formation.etablissement_lieu_formation_code_insee || "",
        cfd: formation.cfd || "",
        rncp_code: formation.rncp_code || "",
        debut_sessions: formation.debut_sessions || "",

        cdf_statut: resultCFd.message,
        cfd_valeur: resultCFd.valeur,
        rncp_statut: resultRNCP.message,
        rncp_valeur: resultRNCP.valeur,
      });
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    console.log(results.length);

    const exporter = new Exporter();
    await exporter.toXlsx(results, "output.xlsx");
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
