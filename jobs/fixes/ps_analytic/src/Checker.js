const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const logger = require("../../../common-jobs/Logger").mainLogger;
const fileManager = require("./FileManager");
const generateMatching = require("./Matcher");
const Exporter = require("./Exporter");
const _ = require("lodash");

const { PsFormations, Establishment } = require("../../../common-jobs/models");

const catalogueEtablissements = require("./assets/etablissements_catalogue.json");

class Checker {
  constructor(props) {
    this.formations = fileManager.getXLSXFile();
  }

  async formatAndUpdate(res) {
    if (!res.matching_uai.find(x => x.data_length > 0) && !res.matching_cfd.find(x => x.data_length > 0)) {
      logger.info("No matching found");
      await PsFormations.findByIdAndUpdate(res.formation._id, {
        matching_type: null,
      });
      return;
    }
    if (!res.matching_uai.find(x => x.data_length > 0)) {
      // traitement CFD
      await updateDB(res.formation, res.matching_cfd);
    } else {
      // traitement UAI
      await updateDB(res.formation, res.matching_uai);
    }
  }

  async updateDB(formation, matching) {
    const found = matching.find(x => x.data_length === 1);
    if (found) {
      await PsFormations.findByIdAndUpdate(formation._id, {
        matching_type: "6",
        matching_mna_formation: found.data,
      });
      logger.info(`Matching found, strengh : ${found.matching_strengh}`);
      return;
    } else {
      let matches = matching
        .filter(x => x.data_length > 0)
        .reduce((acc, item) => {
          if (!acc || item.data_length < acc.data_length) {
            acc = item;
          }
          return acc;
        });

      await PsFormations.findByIdAndUpdate(formation._id, {
        matching_type: `${matches.matching_strengh}`,
        matching_mna_formation: matches.data,
      });
      logger.info(`Matching found, strengh : ${matches.matching_strengh}`);
    }
  }

  async run() {
    const FORMATION_PS = await PsFormations.find().lean();

    await asyncForEach(FORMATION_PS, async (formation, index) => {
      logger.info(
        `formation #${index + 1} : ${line.libelle_uai_affilie}, MEF : ${line.code_mef_10}, CFD : ${line.CFD_VALEUR}/${
          formation.code_cfd
        }`
      );

      const res = generateMatching(line);
      await this.formatAndUpdate(res);
    });
  }

  async custom_xlsx_exporter() {
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

      if (buffer.etablissement.length === 0) return;
      formatted.push({ ...buffer.formation });
      buffer.etablissement.forEach(etab =>
        etab.data.forEach(x =>
          formatted.push({
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

    logger.info("START generating XLSX file....");
    await Exporter.toXlsx(formatted, `matching-${matchingType}.xlsx`);
    logger.info("END generating XLSX file....");
  }
}

const checker = new Checker();
module.exports = checker;
