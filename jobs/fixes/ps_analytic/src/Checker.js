const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const fileManager = require("./FileManager");
const Exporter = require("./Exporter");
const axios = require("axios");
const updatedDiff = require("deep-object-diff").updatedDiff;
const logger = require("../../../common-jobs/Logger").mainLogger;
const _ = require("lodash");
const formations = require("../formations_catalogue.json");
const etablissements = require("../etablissements_catalogue.json");

class Checker {
  constructor() {
    this.formations = fileManager.getXLSXFile();
    this.endpoint = "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";
    this.catalogueFormations = formations;
    this.catalogueEtablissements = etablissements;
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

  async getEtablissements(options) {
    try {
      let { page, allEtablissements, limit, query } = { page: 1, allEtablissements: [], limit: 1050, ...options };

      let params = { page, limit, query };
      logger.debug(`Requesting ${this.endpoint}/etablissements with parameters`, params);
      const response = await axios.get(`${this.endpoint}/etablissements`, { params });

      const { etablissements, pagination } = response.data;
      allEtablissements = allEtablissements.concat(etablissements); // Should be properly exploded, function should be pure

      if (page < pagination.nombre_de_page) {
        return this.getEtablissements({ page: page + 1, allEtablissements, limit });
      } else {
        return allEtablissements;
      }
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async getFormations(options) {
    try {
      let { page, allFormations, limit } = { page: 1, allFormations: [], limit: 1050, ...options };

      let params = { page, limit };
      logger.info(`Requesting ${this.endpoint}/formations with parameters`, params);
      const response = await axios.get(`${this.endpoint}/formations`, { params });

      const { formations, pagination } = response.data;
      allFormations = allFormations.concat(formations); // Should be properly exploded, function should be pure

      if (page < pagination.nombre_de_page) {
        // if (page < 2) {
        return this.getFormations({ page: page + 1, allFormations });
      } else {
        return allFormations;
      }
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  filterbyUai = (catalogue, file) =>
    catalogue.filter(
      x =>
        x.uai_formation === file.UAI_GES ||
        x.uai_formation === file.UAI_COMPOSANTE ||
        x.uai_formation === file.UAI_AFF ||
        x.etablissement_formateur_uai === file.UAI_GES ||
        x.etablissement_formateur_uai === file.UAI_COMPOSANTE ||
        x.etablissement_formateur_uai === file.UAI_AFF ||
        x.etablissement_responsable_uai === file.UAI_GES ||
        x.etablissement_responsable_uai === file.UAI_COMPOSANTE ||
        x.etablissement_responsable_uai === file.UAI_AFF
    );

  matching = (matchType, fichierPsup, catalogue) => {
    const uai =
      catalogue.uai_formation === fichierPsup.UAI_GES ||
      catalogue.uai_formation === fichierPsup.UAI_COMPOSANTE ||
      catalogue.uai_formation === fichierPsup.UAI_AFF ||
      catalogue.etablissement_formateur_uai === fichierPsup.UAI_GES ||
      catalogue.etablissement_formateur_uai === fichierPsup.UAI_COMPOSANTE ||
      catalogue.etablissement_formateur_uai === fichierPsup.UAI_AFF ||
      catalogue.etablissement_responsable_uai === fichierPsup.UAI_GES ||
      catalogue.etablissement_responsable_uai === fichierPsup.UAI_COMPOSANTE ||
      catalogue.etablissement_responsable_uai === fichierPsup.UAI_AFF;

    const codePostal = catalogue.code_postal === fichierPsup.CODEPOSTAL;

    const codeInsee = catalogue.code_commune_insee === fichierPsup.CODECOMMUNE;

    const academie = catalogue.nom_academie === fichierPsup.ACADEMIE;

    const departement = catalogue.num_departement === fichierPsup.CODEPOSTAL.substring(0, 2);

    switch (matchType) {
      case 5:
        return uai && codePostal && codeInsee && academie;
        break;
      case 4:
        return uai && codePostal && codeInsee;
        break;
      case 3:
        return uai && codeInsee;
        break;
      case 2:
        return uai && departement;
        break;
      case 1:
        return uai;
        break;
      default:
        break;
    }
  };

  matchingEtablissement = () => {
    const { catalogueEtablissements, formations } = this;
    const result = [];
    formations.forEach(x => {
      catalogueEtablissements.forEach(y => {
        const data = {
          etab_id: y._id,
          etab_raison_social: y.entreprise_raison_sociale,
          etab_siege_social: y.siege_social === true ? "OUI" : "NON",
          etab_siege_siret: y.etablissement_siege_siret,
          etab_adresse: y.adresse,
          etab_code_postal: y.code_postal,
          etab_formation_total: y.formations_ids.length,
          etab_formation_matcher: 0,
        };
        if (x.UAI_GES === y.uai) {
          result.push({ ...data, etab_matching: "UAI_GES" });
        } else if (x.UAI_AFF === y.uai) {
          result.push({ ...data, etab_matching: "UAI_AFF" });
        } else if (x.UAI_COMPOSANTE === y.uai) {
          result.push({ ...data, etab_matching: "UAI_COMPOSANTE" });
        }
      });
    });

    return result;
  };

  async run() {
    const { catalogueFormations, formations } = this;
    console.log("Formation à traiter", formations.length);

    const scopeFiltrage_1 = await this.matchingEtablissement();

    const formatScopeFiltrage_1 = scopeFiltrage_1.reduce((acc, etablissement) => {
      let index = acc.findIndex(v => v.etab_id === etablissement.etab_id);
      if (index === -1) {
        acc.push(etablissement);
      } else {
        acc[index].etab_formation_matcher++;
      }
      return acc;
    }, []);

    console.log("Resultat du premier filtrage :", formatScopeFiltrage_1.length);
    // console.log("filtered:", filtered);
    // const missingMatch = _.differenceBy(formations, filtrage1, "UAI_GES");
    // console.log("Recoupement non trouvé :", missingMatch.length);
    // console.log("Controle de cohérence:", formations.length, "/", filtrage1.length + missingMatch.length);
    // const exporter = new Exporter();
    // await exporter.toXlsx(z, "filtrage-etab-V2.xlsx");

    const results = [];

    const match5 = _.intersectionWith(formations, catalogueFormations, (formations, catalogueFormations) =>
      this.matching(5, formations, catalogueFormations)
    );
    // .map(x => {
    //   const res = {
    //     ...x,
    //     "Force du matching": "5*",
    //     "Critère du maching": "UAI, CODE_POSTAL, CODE_INSEE, ACADEMIE",
    //   };
    //   results.push(res);
    // });

    // console.log(match5.length);

    match5.map(x => {
      if (!x.CODEMEF) {
        console.log("PAS DE MEF");
        return {
          ...x,
          "Recherche par MEF": "Erreur, pas de MEF associé à la formation",
        };
      }
      /**
       * Recherche des formations par le code MEF
       */
      console.log("RECHERCHE SCOPE", x.CODEMEF);
      const scope = catalogue.filter(y => x.CODEMEF === y.mef_10_code);
      if (!scope) {
        console.log("PAS DE FORMATION RETROUVER PAR LE MEF");
        return {
          ...x,
          "Recherche par MEF": "Erreur, aucune formation retrouvé",
        };
      }
      console.log("formations retrouvé par le code MEF:", scope.length);
    });

    const match4 = _.intersectionWith(fichierPsup, catalogue, (fichierPsup, catalogue) =>
      this.matching(4, fichierPsup, catalogue)
    ).map(x => {
      const res = {
        ...x,
        "Force du matching": "4*",
        "Critère du maching": "UAI, CODE_POSTAL, CODE_INSEE",
      };
      results.push(res);
    });

    const match3 = _.intersectionWith(fichierPsup, catalogue, (fichierPsup, catalogue) =>
      this.matching(3, fichierPsup, catalogue)
    ).map(x => {
      const res = {
        ...x,
        "Force du matching": "3*",
        "Critère du maching": "UAI, CODE_INSEE",
      };
      results.push(res);
    });

    const match2 = _.intersectionWith(fichierPsup, catalogue, (fichierPsup, catalogue) =>
      this.matching(2, fichierPsup, catalogue)
    ).map(x => {
      const res = {
        ...x,
        "Force du matching": "2*",
        "Critère du maching": "UAI, DEPARTEMENT",
      };
      results.push(res);
    });

    const match1 = _.intersectionWith(fichierPsup, catalogue, (fichierPsup, catalogue) =>
      this.matching(1, fichierPsup, catalogue)
    ).map(x => {
      const res = {
        ...x,
        "Force du matching": "1*",
        "Critère du maching": "UAI",
      };
      results.push(res);
    });
  }

  async runOld() {
    const results = [];

    await asyncForEach(this.formations, async (formation, index) => {
      logger.info(`formation #${index + 1} : ${formation.LIB_AFF}, MEF : ${formation.CODEMEF}`);

      let resultCFD = {
        message: "",
        valeur: "",
      };
      let resultRNCP = {
        message: "",
        valeur: "",
      };

      if (!formation.CODEMEF) {
        resultCFD.message = "Erreur";
        resultRNCP.message = "Erreur";
      } else {
        const responseMEF = await this.getMefInfo(formation.CODEMEF);
        if (responseMEF) {
          if (responseMEF.messages.cfdUpdated === "Non trouvé") {
            resultCFD.message = "Code CFD non retrouvé.";
          } else {
            resultCFD.message = "Ok";
            resultCFD.valeur = responseMEF.result.cfd.cfd;
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
      }

      let line = {
        ...formation,
        cdf_statut: resultCFD.message,
        cfd_valeur: resultCFD.valeur,
        rncp_statut: resultRNCP.message,
        rncp_valeur: resultRNCP.valeur,
        catalogue_MNA_statut: "",
        catalogue_MNA_valeur: "",
      };

      console.log(line);

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

      logger.info(`Nombre de formation trouvé : ${responsesCatalogue.formations.length}`);

      if (responsesCatalogue.formations.length === 1) {
        line.catalogue_MNA_statut = `Trouvée (MEF, ACADEMIE, DEPARTEMENT)`;
        line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${responsesCatalogue.formations[0]._id}`;
      } else if (responsesCatalogue.formations.length > 0) {
        const filteredByUais = this.filterbyUai(responsesCatalogue.formations, line);

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
            line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${responsesCatalogue.formations[0]._id}`;
          } else if (responsesCatalogue.formations.length > 0) {
            const filteredByUais = this.filterbyUai(responsesCatalogue.formations, line);

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
              const tmp = responsesCatalogue.formations.map(f => f._id);
              line.catalogue_MNA_statut = "Multiple par UAIs";
              line.catalogue_MNA_valeur = JSON.stringify(tmp);
            } else if (filteredByUais.length === 1) {
              // Match
              line.catalogue_MNA_statut = "Trouvée (UAI, CFD, ACADEMIE, DEPARTEMENT)";
              line.catalogue_MNA_valeur = `https://mna-admin-prod.netlify.app/formation/${filteredByUais[0]._id}`;
            } else {
              const tmp = responsesCatalogue.formations.map(f => f._id);
              line.catalogue_MNA_statut = "Non retrouvée par UAIs";
              line.catalogue_MNA_valeur = JSON.stringify(tmp);
            }
          } else {
            // No match
            line.catalogue_MNA_statut = "Non Trouvée";
          }
        }
      }

      results.push(line);
      logger.info("——————————————————");
    });
    console.log(results.length);
    const exporter = new Exporter();
    await exporter.toXlsx(results, "output.xlsx");
  }
}

const checker = new Checker();
module.exports = checker;
