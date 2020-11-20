const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const fileManager = require("./FileManager");
const Exporter = require("./Exporter");

const updatedDiff = require("deep-object-diff").updatedDiff;
const logger = require("../../../common-jobs/Logger").mainLogger;
const _ = require("lodash");

const { findFormationCatalogue, getEtablissements, getMefInfo } = require("./utils");
const run = require("./Matcher2");
const format = require("./Formater");
const { result } = require("lodash");

const { PsFormations, Establishment } = require("../../../common-jobs/models");

const catalogueEtablissements = require("./assets/etablissements_catalogue.json");

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

  async run_old_1() {
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

  async run_old_2() {
    const FORMATION_PS = await PsFormations.find().lean();
    const chunks = _.chunk(FORMATION_PS, 800);

    // await asyncForEach(chunks, async (chunk, index) => {
    const results = [];

    // logger.info(`Start chunk ${index + 1}/${chunks.length} — ${chunk.length}`);

    await asyncForEach(FORMATION_PS, async (formation, index) => {
      // logger.info(`formation #${index + 1} : ${formation.libelle_uai_affilie}, MEF : ${formation.code_mef_10}`);
      let resultCFD = {
        message: "",
        valeur: "",
      };
      let resultRNCP = {
        message: "",
        valeur: "",
      };

      if (!formation.code_mef_10) {
        resultCFD.message = "Erreur";
        resultRNCP.message = "Erreur";
      } else {
        const responseMEF = await getMefInfo(formation.code_mef_10);
        if (responseMEF) {
          if (responseMEF.messages.cfdUpdated === "Non trouvé") {
            resultCFD.message = "Code CFD non retrouvé.";
          } else {
            resultCFD.message = "OK";
            resultCFD.valeur = responseMEF.result.cfd.cfd;
          }
          if (responseMEF.result.rncp.code_rncp) {
            resultRNCP.message = "OK";
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
        ID_PS_FORMATION: formation._id.toString(),
        CFD_STATUT: resultCFD.message,
        CFD_VALEUR: resultCFD.valeur ? resultCFD.valeur : formation.code_cfd,
        RNCP_STATUS: resultRNCP.message,
        RNCP_VALEUR: resultRNCP.valeur,
        MNA_STATUT: "",
        MNA_MATCHING_TYPE: "",
        MNA_FORMATION_ID: "",
      };

      delete line._id;
      delete line.__v;

      logger.info(
        `formation #${index + 1} : ${line.libelle_uai_affilie}, MEF : ${line.code_mef_10}, CFD : ${line.CFD_VALEUR}/${
          formation.code_cfd
        }`
      );

      const res = run(line);
      console.log(res);

      // format_v1() //add params and update fn
      // format_inDB() //add params and update fn
    });
    // console.log(results.length);
    // logger.info("START generating XLSX file....");
    // await Exporter.toXlsx(results, `output-part${index + 1}.xlsx`);
    // logger.info("END generating XLSX file....");
    // });
  }

  async run() {
    const matchingType = "1";
    const match = await PsFormations.find({ matching_type: matchingType }).lean();
    logger.info(`${match.length} formation à traiter`);

    let buffer = {};
    let formatted = [];

    await asyncForEach(match, async (item, index) => {
      const formation = item.matching_mna_formation[0];
      logger.info(`${""} formation à traiter ${index}/${match.length}`);

      buffer.formation = { ...item };
      buffer.formation._id = buffer.formation._id.toString();
      delete buffer.formation.matching_mna_formation;
      delete buffer.formation.__v;
      buffer.etablissement = [];

      let resuai, resformateur, resetablissement;

      // const resuai = await getEtablissements({ query: { uai: formation.uai_formation } })
      // const resformateur = await getEtablissements({ query: { uai: formation.etablissement_formateur_uai } });
      // const resetablissement = await getEtablissements({ query: { uai: formation.etablissement_formateur_uai } });

      if (formation.uai_formation > 0) {
        resuai = catalogueEtablissements.filter(x => x.uai === formation.uai_formation);
        if (resuai.length > 0) {
          logger.info("getEtablissements by UAI");
          buffer.etablissement.push({ data: resformateur, matched_uai: "UAI_FORMATION" });
        }
      }
      if (formation.etablissement_formateur_uai) {
        resformateur = catalogueEtablissements.filter(x => x.uai === formation.etablissement_formateur_uai);
        if (resformateur.length > 0) {
          logger.info("getEtablissements by FORMATEUR");
          buffer.etablissement.push({ data: resformateur, matched_uai: "UAI_FORMATEUR" });
        }
      }
      if (formation.etablissement_responsable_uai) {
        resetablissement = catalogueEtablissements.filter(x => x.uai === formation.etablissement_formateur_uai);
        if (resetablissement.length > 0) {
          logger.info("—— getEtablissements by RESPONSABLE");
          buffer.etablissement.push({ data: resetablissement, matched_uai: "UAI_RESPONSABLE" });
        }
      }

      // console.log({
      //   UAI_FORMATION: {
      //     uai: formation.uai_formation,
      //     data: resuai && resuai.length,
      //   },
      //   UAI_FORMATEUR: {
      //     uai: formation.etablissement_formateur_uai,
      //     data: resformateur && resformateur.length,
      //   },
      //   UAI_RESP: {
      //     uai: formation.etablissement_responsable_uai,
      //     data: resetablissement && resetablissement.length,
      //   },
      // });

      console.log(buffer);

      if (buffer.etablissement.length === 0) return;
      formatted.push({ ...buffer.formation });
      buffer.etablissement.forEach(etab =>
        etab.data.forEach(x =>
          formatted.push({
            // ...x,
            ...Object.keys(etab).reduce((acc, key) => {
              return { ...acc, [key]: "" };
            }, {}),
            matched_uai: etab.matched_uai,
            formation_id: buffer.formation._id.toString(),
            etablissement_id: x._id,
            etablissement_nom: x.enseigne,
            etablissement_raison_social: x.entreprise_forme_juridique,
            etablissement_adresse_postal: x.adresse,
            etablissement_code_postal: x.code_postal,
            etablissement_localite: x.region_implantation_nom,
            etablissement_code_commune_insee: x.code_insee_localite,
            etablissement_siret: x.siret,
            etablissement_uai: x.uai,
            etablissement_geoloc: x.geo_coordonnees,
          })
        )
      );
    });
    // console.log(formatted, formatted.length);

    logger.info("START generating XLSX file....");
    await Exporter.toXlsx(formatted, `matching-${matchingType}.xlsx`);
    logger.info("END generating XLSX file....");
  }
}

const format_v1 = async () => {
  if (!res.matching_uai.find(x => x.data_length > 0) && !res.matching_cfd.find(x => x.data_length > 0)) {
    res.formation.MNA_STATUT = "Aucun matching";
    results.push({
      ...res.formation,
    });
    return;
  }
  if (!res.matching_uai.find(x => x.data_length > 0)) {
    // traitement CFD
    const found = res.matching_cfd.find(x => x.data_length === 1);
    if (found) {
      res.formation.MNA_STATUT = `Matching 6*`;
      res.formation.MNA_STATUT_CODE = 6;
      res.formation.MNA_MATCHING_TYPE = "CFD";
      res.formation.MNA_FORMATION_ID = found.data[0]._id;
      results.push({
        ...res.formation,
        ...found.data[0],
      });
    } else {
      let matchingcfd = res.matching_cfd
        .filter(x => x.data_length > 0)
        .reduce((acc, item) => {
          if (!acc || item.data_length < acc.data_length) {
            acc = item;
          }
          return acc;
        });

      res.formation.MNA_STATUT = `Matching ${matchingcfd.matching_strengh}*`;
      res.formation.MNA_MATCHING_TYPE = "CFD";
      results.push({ ...res.formation });

      matchingcfd.data.forEach(x => {
        results.push({
          ...Object.keys(line).reduce((acc, key) => {
            return { ...acc, [key]: "" };
          }, {}),
          MNA_FORMATION_ID: x._id,
          ...x,
        });
      });
    }
  } else {
    // traitement UAI
    const found = res.matching_uai.find(x => x.data_length === 1);
    if (found) {
      res.formation.MNA_STATUT = `Matching 6*`;
      res.formation.MNA_STATUT_CODE = 6;
      res.formation.MNA_MATCHING_TYPE = "UAI";
      res.formation.MNA_FORMATION_ID = found.data[0]._id;
      results.push({
        ...res.formation,
        ...found.data[0],
      });
    } else {
      let matchinguai = res.matching_uai
        .filter(x => x.data_length > 0)
        .reduce((acc, item) => {
          if (!acc || item.data_length < acc.data_length) {
            acc = item;
          }
          return acc;
        });

      res.formation.MNA_STATUT = `Matching ${matchinguai.matching_strengh}*`;
      res.formation.MNA_MATCHING_TYPE = "UAI";
      results.push({ ...res.formation });

      matchinguai.data.forEach(x => {
        results.push({
          ...Object.keys(line).reduce((acc, key) => {
            return { ...acc, [key]: "" };
          }, {}),
          MNA_FORMATION_ID: x._id,
          ...x,
        });
      });
    }
  }
};

const format_inDB = async res => {
  if (!res.matching_uai.find(x => x.data_length > 0) && !res.matching_cfd.find(x => x.data_length > 0)) {
    // res.formation.MNA_STATUT = "Aucun matching";
    await PsFormations.findByIdAndUpdate(res.formation.ID_PS_FORMATION, {
      matching_type: null,
    });
    console.log("UPDATE NO MATCH");
    return;
  }
  if (!res.matching_uai.find(x => x.data_length > 0)) {
    // traitement CFD
    const found = res.matching_cfd.find(x => x.data_length === 1);
    if (found) {
      await PsFormations.findByIdAndUpdate(res.formation.ID_PS_FORMATION, {
        matching_type: "6",
        matching_mna_formation: found.data,
      });
      console.log("———————————— UPDATE MATCH", found.matching_strengh);
      return;
    } else {
      let matchingcfd = res.matching_cfd
        .filter(x => x.data_length > 0)
        .reduce((acc, item) => {
          if (!acc || item.data_length < acc.data_length) {
            acc = item;
          }
          return acc;
        });

      await PsFormations.findByIdAndUpdate(res.formation.ID_PS_FORMATION, {
        matching_type: `${matchingcfd.matching_strengh}`,
        matching_mna_formation: matchingcfd.data,
      });
      console.log("———————————— UPDATE MATCH", matchingcfd.matching_strengh, matchingcfd.data.length);
    }
  } else {
    // traitement UAI
    const found = res.matching_uai.find(x => x.data_length === 1);
    if (found) {
      await PsFormations.findByIdAndUpdate(res.formation.ID_PS_FORMATION, {
        matching_type: "6",
        matching_mna_formation: found.data,
      });
      console.log("———————————— UPDATE MATCH", found.matching_strengh);
    } else {
      let matchinguai = res.matching_uai
        .filter(x => x.data_length > 0)
        .reduce((acc, item) => {
          if (!acc || item.data_length < acc.data_length) {
            acc = item;
          }
          return acc;
        });

      await PsFormations.findByIdAndUpdate(res.formation.ID_PS_FORMATION, {
        matching_type: `${matchinguai.matching_strengh}`,
        matching_mna_formation: matchinguai.data,
      });
      console.log("———————————— UPDATE MATCH", matchinguai.matching_strengh, matchinguai.data.length);
    }
  }
};

const checker = new Checker();
module.exports = checker;
