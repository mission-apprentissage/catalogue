const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const fileManager = require("./FileManager");
const Exporter = require("./Exporter");
const axios = require("axios");
const updatedDiff = require("deep-object-diff").updatedDiff;

class Checker {
  constructor() {
    this.formations = fileManager.getXLSXFile();
  }

  async run() {
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
      if (formation.CODEMEF) {
        const responseMEF = await this.getMefInfo(formation.CODEMEF);
        if (responseMEF) {
          if (responseMEF.messages.cfdUpdated === "Non trouvé") {
            resultCFd.message = "Code CFD non retrouvé.";
          } else {
            resultCFd.message = "Ok";
            resultCFd.valeur = responseMEF.result.cfd.cfd;
          }
          if (responseMEF.result.rncp.code_rncp) {
            resultRNCP.message = "Ok";
            if (responseMEF.result.rncp.code_rncp === "NR") {
              resultRNCP.message = `le CFD ${responseMEF.result.cfd.cfd} n'est pas encore répertorié par France Compétences`;
            } else {
              resultRNCP.valeur = `${responseMEF.result.rncp.code_rncp}`;
            }
          } else {
            resultRNCP.message = "Code RNCP aucune correspondance n'est retrouvée";
            resultRNCP.valeur = "";
          }
        } else {
          console.log("ERROR");
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

      let line = {
        ...formation,
        cdf_statut: resultCFd.message,
        cfd_valeur: resultCFd.valeur,
        rncp_statut: resultRNCP.message,
        rncp_valeur: resultRNCP.valeur,
        catalogue_MNA_statut: "",
        catalogue_MNA_valeur: "",
      };

      let responsesCatalogue = await this.findFormationCatalogue({
        query: {
          //educ_nat_code: line.cfd_valeur,
          nom_academie: line["ACADÉMIE"],
          num_departement: line.CODEPOSTAL.substring(0, 2),
          mef_10_code: line.CODEMEF,
          //code_postal: line.CODEPOSTAL,
          //code_commune_insee: line.CODECOMMUNE,
        },
        limit: 100,
      });

      if (responsesCatalogue.formations.length === 1) {
        line.catalogue_MNA_statut = `Trouvée (MEF, ACADEMIE, DEPARTEMENT)`;
        //, MEF:${line.CODEMEF}, nom_academie:${line["ACADÉMIE"]},  num_departement: ${line.CODEPOSTAL.substring(0, 2)}
        line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${responsesCatalogue.formations[0]._id}`;
      } else if (responsesCatalogue.formations.length > 0) {
        const filteredByUais = responsesCatalogue.formations.filter(
          f =>
            f.uai_formation === line.UAI_GES ||
            f.uai_formation === line.UAI_COMPOSANTE ||
            f.uai_formation === line.UAI_AFF ||
            f.etablissement_formateur_uai === line.UAI_GES ||
            f.etablissement_formateur_uai === line.UAI_COMPOSANTE ||
            f.etablissement_formateur_uai === line.UAI_AFF ||
            f.etablissement_responsable_uai === line.UAI_GES ||
            f.etablissement_responsable_uai === line.UAI_COMPOSANTE ||
            f.etablissement_responsable_uai === line.UAI_AFF
        );

        if (filteredByUais.length === 1) {
          line.catalogue_MNA_statut = "Trouvée (UAI, MEF, ACADEMIE, DEPARTEMENT)";
          line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${filteredByUais[0]._id}`;
        }
      } else {
        if (line.cdf_statut === "Ok") {
          responsesCatalogue = await this.findFormationCatalogue({
            query: {
              educ_nat_code: line.cfd_valeur,
              nom_academie: line["ACADÉMIE"],
              num_departement: line.CODEPOSTAL.substring(0, 2),
              //mef_10_code: line.CODEMEF,
              //code_postal: line.CODEPOSTAL,
              //code_commune_insee: line.CODECOMMUNE,
            },
            limit: 100,
          });
          if (responsesCatalogue.formations.length === 1) {
            line.catalogue_MNA_statut = `Trouvée (CFD, ACADEMIE, DEPARTEMENT)`;
            //`1 formation trouvée sur les critères cfd:${line.cfd_valeur}, nom_academie:${
            //  line["ACADÉMIE"]
            //},  num_departement: ${line.CODEPOSTAL.substring(0, 2)}`;
            line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${responsesCatalogue.formations[0]._id}`;
          } else if (responsesCatalogue.formations.length > 0) {
            const filteredByUais = responsesCatalogue.formations.filter(
              f =>
                f.uai_formation === line.UAI_GES ||
                f.uai_formation === line.UAI_COMPOSANTE ||
                f.uai_formation === line.UAI_AFF ||
                f.etablissement_formateur_uai === line.UAI_GES ||
                f.etablissement_formateur_uai === line.UAI_COMPOSANTE ||
                f.etablissement_formateur_uai === line.UAI_AFF ||
                f.etablissement_responsable_uai === line.UAI_GES ||
                f.etablissement_responsable_uai === line.UAI_COMPOSANTE ||
                f.etablissement_responsable_uai === line.UAI_AFF
            );

            //console.log(filteredByUais.length);
            //console.log("--");

            if (filteredByUais.length === 2) {
              let uDiff = updatedDiff(filteredByUais[0], filteredByUais[1]);
              const idF = uDiff._id;
              delete uDiff._id;
              delete uDiff.last_update_at;
              delete uDiff.created_at;
              delete uDiff.last_modification;
              delete uDiff.__v;
              delete uDiff.nom;
              delete uDiff.commentaires;
              delete uDiff.nom_academie_siege;
              delete uDiff.published_old;
              delete uDiff.to_verified;
              delete uDiff.capacite;
              delete uDiff.periode;
              delete uDiff.ds_id_dossier;
              const ukeys = Object.keys(uDiff);
              if (ukeys.length > 2) {
                console.log(ukeys, filteredByUais[0]._id, filteredByUais[1]._id);
              } else if (ukeys.includes("mef_10_code") && ukeys.includes("annee")) {
                line.catalogue_MNA_statut = "Trouvée (UAI, CFD, ACADEMIE, DEPARTEMENT)";
                line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${idF}`;
              } else {
                console.log(ukeys);
              }
            } else if (filteredByUais.length >= 2) {
              // line.catalogue_MNA_statut = "Multiple par UAIs";
              // const tmp = responsesCatalogue.formations.map(f => f._id);
              // line.catalogue_MNA_valeur = JSON.stringify(tmp);
            } else if (filteredByUais.length === 1) {
              // Match
              line.catalogue_MNA_statut = "Trouvée (UAI, CFD, ACADEMIE, DEPARTEMENT)";
              line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${filteredByUais[0]._id}`;
            } else {
              // line.catalogue_MNA_statut = "Non retrouvée par UAIs";
              // const tmp = responsesCatalogue.formations.map(f => f._id);
              // line.catalogue_MNA_valeur = JSON.stringify(tmp);
            }
          } else {
            // No match
            line.catalogue_MNA_statut = "Non Trouvée";
          }
        }
      }

      results.push(line);
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    console.log(results.length);
    const exporter = new Exporter();
    await exporter.toXlsx(results, "output.xlsx");
  }

  async getMefInfo(mef) {
    try {
      const response = await axios.post(`https://tables-correspondances-recette.apprentissage.beta.gouv.fr/api/mef`, {
        mef,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findFormationCatalogue(params) {
    try {
      const response = await axios.get(`https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod/formations`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

const checker = new Checker();
module.exports = checker;
