const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const fileManager = require("./FileManager");
const Exporter = require("./Exporter");

const updatedDiff = require("deep-object-diff").updatedDiff;
const logger = require("../../../common-jobs/Logger").mainLogger;
const _ = require("lodash");

const { findFormationCatalogue, getEtablissements } = require("./utils");

class Checker {
  constructor(props) {
    this.formations = fileManager.getXLSXFile();
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

  premierFiltrage = (catalogueEtablissements, formations) => {
    const resultatPremierFiltrage = [];

    formations.forEach(x => {
      catalogueEtablissements.forEach(y => {
        const data = {
          ...x,
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
          resultatPremierFiltrage.push({ ...data, etab_matching: "UAI_GES", uai: x.UAI_GES });
        } else if (x.UAI_AFF === y.uai) {
          resultatPremierFiltrage.push({ ...data, etab_matching: "UAI_AFF", uai: x.UAI_AFF });
        } else if (x.UAI_COMPOSANTE === y.uai) {
          resultatPremierFiltrage.push({ ...data, etab_matching: "UAI_COMPOSANTE", uai: x.UAI_COMPOSANTE });
        }
      });
    });

    const formatedData = resultatPremierFiltrage.reduce((acc, etablissement) => {
      let index = acc.findIndex(v => v.etab_id === etablissement.etab_id);

      if (index === -1) {
        acc.push(etablissement);
      } else {
        acc[index].etab_formation_matcher++;
      }
      return acc;
    }, []);

    return { resultatPremierFiltrage, formatedData };
  };

  deuxiemeFiltrage = (catalogueEtablissements, data) => {
    const etablissementAvecFormation = catalogueEtablissements.filter(x => x.formations_ids.length !== 0);
    logger.info(`Etablissement contenant une ou plusieurs formation rattaché : ${etablissementAvecFormation.length}`);

    const filtCodePostal = _.intersectionWith(
      data,
      etablissementAvecFormation,
      (data, etablissementAvecFormation) => data.CODEPOSTAL === etablissementAvecFormation.code_postal
    ).map(o => {
      const found = etablissementAvecFormation.find(x => o.CODEPOSTAL === x.code_postal);
      if (found)
        return {
          MATCHING_CODEPOSTAL: o.CODEPOSTAL,
          ...o,
          ...found,
        };
    });

    const filtCodeInsee = _.intersectionWith(
      data,
      etablissementAvecFormation,
      (data, etablissementAvecFormation) => data.CODECOMMUNE === etablissementAvecFormation.code_insee_localite
    ).map(o => {
      const found = etablissementAvecFormation.find(x => o.CODECOMMUNE === x.code_insee_localite);
      if (found)
        return {
          ...o,
          etab_id: found._id,
          etab_raison_social: found.entreprise_raison_sociale,
          etab_siege_social: found.siege_social === true ? "OUI" : "NON",
          etab_siege_siret: found.etablissement_siege_siret,
          etab_adresse: found.adresse,
          etab_code_postal: found.code_postal,
          etab_formation_total: found.formations_ids.length,
        };
    });

    const filtDuo = _.intersectionWith(
      data,
      etablissementAvecFormation,
      (data, etablissementAvecFormation) =>
        data.CODECOMMUNE === etablissementAvecFormation.code_insee_localite &&
        data.CODEPOSTAL === etablissementAvecFormation.code_postal
    ).map(o => {
      const found = etablissementAvecFormation.find(
        x => o.CODEPOSTAL === x.code_postal && o.CODECOMMUNE === x.code_insee_localite
      );
      if (found)
        return {
          ...o,
          etab_id: found._id,
          etab_raison_social: found.entreprise_raison_sociale,
          etab_siege_social: found.siege_social === true ? "OUI" : "NON",
          etab_siege_siret: found.etablissement_siege_siret,
          etab_adresse: found.adresse,
          etab_code_postal: found.code_postal,
          etab_formation_total: found.formations_ids.length,
        };
    });

    return { filtCodePostal, filtCodeInsee, filtDuo };
  };

  async run() {
    const { formations } = this;
    logger.info("Récupération des établissements depuis le catalogue");
    const catalogueEtablissements = await getEtablissements();
    logger.info(`Formation à traiter : ${formations.length}, Etablissements : ${catalogueEtablissements.length}`);

    const { resultatPremierFiltrage, formatedData } = await this.premierFiltrage(catalogueEtablissements, formations);
    logger.info(`Resultat du premier filtrage : ${resultatPremierFiltrage.length}`);
    logger.info(`Formattage du premier filtrage : ${formatedData.length}`);

    await Exporter.toXlsx(formatedData, "filtrage1-etab.xlsx");

    const substractP1 = _.differenceWith(formations, resultatPremierFiltrage, (formations, resultatPremierFiltrage) => {
      return (
        formations.UAI_GES === resultatPremierFiltrage.UAI_GES ||
        formations.UAI_AFF === resultatPremierFiltrage.UAI_AFF ||
        formations.UAI_COMPOSANTE === resultatPremierFiltrage.UAI_COMPOSANTE
      );
    });
    logger.info(`Recoupement non trouvé à traiter : ${substractP1.length}`);

    const { filtCodePostal, filtCodeInsee, filtDuo } = this.deuxiemeFiltrage(catalogueEtablissements, substractP1);
    logger.info(`Recoupement code postal : ${filtCodePostal.length}`);
    logger.info(`Recoupement code insee : ${filtCodeInsee.length}`);
    logger.info(`Recoupement code postal & insee : ${filtDuo.length}`);

    await Exporter.toXlsx(filtCodePostal, "filtrage2-etab-codepostal.xlsx");
    await Exporter.toXlsx(filtCodeInsee, "filtrage2-etab-codeinsee.xlsx");
    await Exporter.toXlsx(filtDuo, "filtrage2-etab-codepostal_codeinsee.xlsx");
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

      let responsesCatalogue = await findFormationCatalogue({
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
    });
    console.log(results.length);
    await Exporter.toXlsx(results, "output.xlsx");
  }
}

const checker = new Checker();
module.exports = checker;
