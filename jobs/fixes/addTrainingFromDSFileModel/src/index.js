const path = require("path");
const { connectToMongo } = require("../../../common/mongo");
const { Establishment, Formation } = require("../../../common/models");

const fileManager = require("./services/FileManager");
const formatingModel = require("./services/FormatingModel");
const dsFetcher = require("./services/DSFetcher");
const asyncForEach = require("../../../common/utils").asyncForEach;

// const CASE = {
//   idDossier: 1202774,
//   file_path: "PJ_1202774.xlsx",
//   numAcademie: "16",
//   range: 2,
//   formatPeriode: true,
//   formatNiveau: true,
// };

// const CASE = {
//   idDossier: 1207963,
//   file_path: "PJ_1207963.xlsm",
//   numAcademie: "20",
//   range: 4,
//   formatPeriode: true,
//   formatNiveau: true,
// };

// const CASE = {
//   idDossier: 1181967,
//   file_path: "PJ_1181967.xlsx",
//   numAcademie: "8",
//   range: 1,
//   formatPeriode: false,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1198674,
//   file_path: "PJ_1198674.xls",
//   numAcademie: "14",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1188891,
//   file_path: "PJ_1188891.xlsx",
//   numAcademie: "17",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1255294,
//   file_path: "PJ_1255294.xlsx",
//   numAcademie: "6",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1202202,
//   file_path: "PJ_1202202.xlsx",
//   numAcademie: "18",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1213254,
//   file_path: "PJ_1213254.xlsx",
//   numAcademie: "2",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1182092,
//   file_path: "PJ_1182092.xlsx",
//   numAcademie: "21",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };

// const CASE = {
//   idDossier: 1264482,
//   file_path: "PJ_1264482.xlsx",
//   numAcademie: "11",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1264938,
//   file_path: "PJ_1264938.xlsx",
//   numAcademie: "11",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };

// const CASE = {
//   idDossier: 1237664,
//   file_path: "PJ_1237664.xlsx",
//   numAcademie: "3",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1182045,
//   file_path: "1182045.xlsx",
//   numAcademie: "10",
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };

// const CASE = {
//   idDossier: 1309275,
//   file_path: "1309275.xlsx",
//   numAcademie: "20",
//   range: 2,
//   formatPeriode: true,
//   formatNiveau: true,
// };
// const CASE = {
//   idDossier: 1326726,
//   file_path: "1326726.xlsx",
//   numAcademie: 23,
//   range: 1,
//   formatPeriode: true,
//   formatNiveau: true,
// };

const CASE = {
  idDossier: 1331140,
  file_path: "1331140.xlsx",
  numAcademie: 12,
  range: 1,
  formatPeriode: true,
  formatNiveau: true,
};

const ID_DOSSIER = CASE.idDossier;
const FILE_PATH = path.join(__dirname, `../input/${CASE.file_path}`);

const run = async () => {
  try {
    console.group(` -- Start Training from DS file -- `);
    await connectToMongo();

    let etablissementFormateur = await Establishment.findOne({
      ds_id_dossier: `${ID_DOSSIER}`,
    });

    if (!etablissementFormateur) {
      const dsEtablishment = await dsFetcher.getEtablishment(ID_DOSSIER);
      etablissementFormateur = new Establishment(mapNewModelEtablishment(dsEtablishment));
      await etablissementFormateur.save();
    }

    // Find etablissement Responsable
    const etablissementResponsable = await Establishment.findOne({
      siret: etablissementFormateur.siret_siege_social,
    });

    if (etablissementFormateur) {
      const trainingHeader = {
        ds_id_dossier: `${ID_DOSSIER}`,
        etablissement_responsable_siret: etablissementFormateur.siret_siege_social,
        etablissement_formateur_siret: etablissementFormateur.siret,
        siren: etablissementFormateur.siren,
        source: "DS",

        num_academie: CASE.numAcademie,
        published_old: true,
        to_verified: false,
        parcoursup_reference: "NON",
      };
      const catalogue = fileManager.getDataFromFile(FILE_PATH, CASE.range);
      const formatedCatalogue = [];
      for (const formation of catalogue) {
        const item = formatingModel.format(
          {
            ...trainingHeader,
            ...formation,
          },
          etablissementResponsable,
          etablissementFormateur,
          CASE.formatPeriode,
          CASE.formatNiveau
        );
        if (item) {
          formatedCatalogue.push(item);
        }
      }
      //console.log(formatedCatalogue);
      await asyncForEach(formatedCatalogue, async currentTraining => {
        const formation = new Formation(currentTraining);
        await formation.save();
      });
    }

    console.group(` -- End Training from DS file -- `);
    console.groupEnd();
  } catch (err) {
    console.log(err);
  }
};

run();

const mapNewModelEtablishment = oldModel => {
  return {
    siret: oldModel.siret,
    siren: oldModel.siren,
    capital_social: oldModel.capital_social || null,
    numero_tva_intracommunautaire: oldModel.numero_tva_intracommunautaire,
    forme_juridique_code: oldModel.forme_juridique_code,
    forme_juridique: oldModel.forme_juridique,
    nom_commercial: oldModel.nom_commercial,
    raison_sociale: oldModel.raison_sociale,
    code_effectif_entreprise: oldModel.code_effectif_entreprise,
    siret_siege_social: oldModel.siret_siege_social,
    date_creation: oldModel.date_creation,
    nom: oldModel.nom,
    prenom: oldModel.prenom,
    siege_social: oldModel.siege_social,
    naf_code: oldModel.naf,
    naf_libelle: oldModel.libelle_naf,
    adresse: oldModel.adresse,
    complement_adresse: oldModel.complement_adresse || null,
    numero_voie: oldModel.numero_voie || null,
    type_voie: oldModel.type_voie || null,
    nom_voie: oldModel.nom_voie,
    code_postal: oldModel.code_postal,
    localite: oldModel.localite,
    code_insee_localite: oldModel.code_insee_localite,
    ds_id_dossier: oldModel.id,

    created_at: oldModel.createdAt || Date.now(),
    last_update_at: oldModel.lastUpdateAt || Date.now(),

    ds_questions_siren: oldModel.siren,
    ds_questions_nom: oldModel.ds_questions_nom,
    ds_questions_email: oldModel.ds_questions_email,
    ds_questions_uai: oldModel.ds_questions_uai,
    ds_questions_has_agrement_cfa: oldModel.ds_questions_hasAgrementCFA,
    ds_questions_has_certificaton_2015: oldModel.ds_questions_hasCertificaton2015,
    ds_questions_has_ask_for_certificaton: oldModel.ds_questions_hasAskForCertificaton,
    ds_questions_ask_for_certificaton_date: oldModel.ds_questions_askForCertificatonDate,
    ds_questions_declaration_code: oldModel.ds_questions_declarationCode,
    ds_questions_has_2020_training: oldModel.ds_questions_has2020Training,
    uai: oldModel.uai,
  };
};
