// #region Imports

const { infosCodes, PATH_RCO_EXPORT } = require("./Constants");
const api = require("../../../../../../common/api");
const { connectToMongo, closeMongoConnection } = require("../../../../../../common/mongo");
const { Formation, Establishment } = require("../../../../../../common/models2");
const asyncForEach = require("../../../../../common-jobs/utils").asyncForEach;
// const { filter, find } = require("lodash");
const fileManager = require("./FileManager");

// #endregion

class RcoChecker {
  constructor() {
    this.baseRCO = fileManager.getDataRcoFromFile(PATH_RCO_EXPORT);
    this.stats = {
      total: this.baseRCO.length,
      etablissements_found: 0,
      codeEn_error_bcn: 0,
      codeEn_Ok_bcn: 0,
      no_uai_rco: 0,
      uai_rco_found_etablissements: 0,
      uai_rco_not_found_etablissements: 0,
      rncp_found_and_equal: 0,
      rncp_found_no_equal: 0,
      rncp_not_found: 0,
      training_found_in_catalogue: 0,
      training_not_found_in_catalogue: 0,
      code_RNCP_give_same_codeEn_yes: 0,
      code_RNCP_give_same_codeEn_no: 0,
      // new_etablissement_not_published: 0,
      // new_etablissement_no_trainings: 0,
      // etablissements_not_found: 0,
      // etablissement_responsable_not_found: 0,
      // etablissement_formateur_not_found: 0,
      // siret_not_found_unique: 0,
    };
  }

  async run() {
    //console.log(this.baseRCO);
    //const uniqSiret = [];
    await asyncForEach(this.baseRCO, async rcoItem => {
      await connectToMongo();
      // Look for existing etablissement
      let etablissement_responsable = await Establishment.findOne({ siret: rcoItem.siret_CFA_OFA });
      let etablissement_formateur = await Establishment.findOne({ siret: rcoItem.siret_formateur });

      if (etablissement_responsable && etablissement_formateur) {
        if (rcoItem.codeEducNat && rcoItem.codeRNCP) {
          this.stats.etablissements_found++;
          let formation = new Formation({
            educ_nat_code: rcoItem.codeEducNat,
            //uai_formation: rcoItem.uai,
            code_postal: rcoItem.codePostal,
            etablissement_formateur_siret: rcoItem.siret_formateur,
            etablissement_responsable_siret: rcoItem.siret_CFA_OFA,
          });
          await formation.save();

          const { run: trainingsUpdater } = require(`../../../../formations/trainingsUpdater/src/trainingsUpdater`);
          await trainingsUpdater({ _id: formation._id });

          const { run: runRncpReverse } = require(`../../../../rncpToCodeEn/src/index`);
          await runRncpReverse({ query: { _id: formation._id }, mode: "enToRncp" });

          formation = await Formation.findOne({ _id: formation._id });

          await Formation.findOneAndRemove({ _id: formation._id });

          //console.log(formation);

          if (formation.info_bcn_code_en === 0 || formation.info_bcn_code_en === 1) {
            this.stats.codeEn_error_bcn++;
          } else {
            this.stats.codeEn_Ok_bcn++;
          }

          if (formation.rncp_code && formation.rncp_code === `RNCP${rcoItem.codeRNCP}`) {
            this.stats.rncp_found_and_equal++;
          } else {
            if (!formation.rncp_code) {
              this.stats.rncp_not_found++;
            } else {
              this.stats.rncp_found_no_equal++;
            }
          }

          if (!rcoItem.uai) {
            this.stats.no_uai_rco++;
          } else {
            if ([etablissement_responsable.uai, etablissement_formateur.uai].includes(rcoItem.uai)) {
              this.stats.uai_rco_found_etablissements++;
            } else {
              this.stats.uai_rco_not_found_etablissements++;
            }
          }

          await this.validateCodeEnViaRNCP(`RNCP${rcoItem.codeRNCP}`, rcoItem.codeEducNat);

          const lookup = await Formation.findOne({
            educ_nat_code: formation.educ_nat_code,
            //code_postal: formation.code_postal,
            //intitule_long: formation.intitule_long,
            //rncp_code: formation.rncp_code,

            //etablissement_formateur_siret: formation.etablissement_formateur_siret,
            etablissement_responsable_siret: formation.etablissement_responsable_siret,
          });
          if (lookup) {
            this.stats.training_found_in_catalogue++;
            // SI TROUVER COMPARÉ
          } else {
            this.stats.training_not_found_in_catalogue++;
          }
        }
      }

      // if (rcoItem.siret_CFA_OFA === rcoItem.siret_formateur && !etablissement_responsable) {
      //   if (uniqSiret.indexOf(rcoItem.siret_CFA_OFA) === -1) {
      //     uniqSiret.push(rcoItem.siret_CFA_OFA);
      //     await this.validateSiret(rcoItem.siret_CFA_OFA);
      //   }

      //   this.stats.etablissements_not_found++;
      // }
      // if (rcoItem.siret_CFA_OFA !== rcoItem.siret_formateur && !etablissement_responsable) {
      //   if (uniqSiret.indexOf(rcoItem.siret_CFA_OFA) === -1) {
      //     uniqSiret.push(rcoItem.siret_CFA_OFA);
      //     await this.validateSiret(rcoItem.siret_CFA_OFA);
      //   }
      //   this.stats.etablissement_responsable_not_found++;
      // }
      // if (rcoItem.siret_CFA_OFA !== rcoItem.siret_formateur && !etablissement_formateur) {
      //   if (uniqSiret.indexOf(rcoItem.siret_formateur) === -1) {
      //     uniqSiret.push(rcoItem.siret_formateur);
      //     await this.validateSiret(rcoItem.siret_formateur);
      //   }
      //   this.stats.etablissement_formateur_not_found++;
      // }

      // let formation = new Formation({
      //   educ_nat_code: rcoItem.codeEducNat,
      //   uai_formation: rcoItem.uai,
      //   code_postal: rcoItem.codePostal,
      //   etablissement_formateur_siret: rcoItem.siret_formateur,
      //   etablissement_responsable_siret: rcoItem.siret_CFA_OFA,
      // });
      // await formation.save();

      // const { run: trainingsUpdater } = require(`../../../../formations/trainingsUpdater/src/trainingsUpdater`);
      // await trainingsUpdater({ _id: formation._id });

      // formation = await Formation.findOne({ _id: formation._id });

      // await Formation.findOneAndRemove({ _id: formation._id });

      // if (formation.intitule_long && formation.intitule_long.trim() !== rcoItem.intitule.trim()) {
      //   stats.intitule_not_match++;
      // }

      closeMongoConnection();

      // "codeRegion", // -
      // "intituleRegion", // -
      // "numeroFO", // -
      // "numeroAf", // -
      // "nom", // nom
      // "codeCERTIFINFO", // -
      // "diplome", // diplome
      // "intitule", // intitule_long
      // "codeEducNat", // educ_nat_code
      // "codeNiveauEN", // Old niveau
      // "nomNiveauEN", // -
      // "niveau", // niveau
      // "nomNiveau", // -
      // "nomCFA_OFA_Responsable", // etablissement_responsable_enseigne
      // "raisonSocialeCFA_OFA", // entreprise_raison_sociale
      // "siret_CFA_OFA", // etablissement_responsable_siret
      // "siret_formateur", //etablissement siret - etablissement_formateur_siret
      // "raisonSocialeFormateur", //  etablissement siret -  entreprise_raison_sociale
      // "modaliteEntreesSorties", // -
      // "periode", // periode
      // "uai", // uai_formation
      // "email", // email
      // "codePostal", // code_postal
      // "codeCommuneInsee", // code_commune_insee
      // "capacite", // capacite
      // "identifiantSession", // -
      // "codeRNCP", // rncp_code
      // "nbHeuresTotalAF", // -
      // "cas", // -
      // "casLibelle", // -
    });
    //this.stats.siret_not_found_unique = uniqSiret.length;
    console.log(this.stats);
  }

  async validateSiret(siret) {
    let etablissement = new Establishment({ siret });
    await etablissement.save();
    const {
      run: etablishmentsUpdater,
    } = require(`../../../../etablissements/etablishmentsUpdater/src/etablishmentsUpdater`);
    await etablishmentsUpdater({ _id: etablissement._id });
    etablissement = await Establishment.findOne({ _id: etablissement._id });
    await Establishment.findOneAndRemove({ _id: etablissement._id });

    if (!etablissement.formations_attachees) {
      this.stats.new_etablissement_no_trainings++;
    }
    if (etablissement.ferme || !etablissement.api_entreprise_reference) {
      this.stats.new_etablissement_not_published++;
    }
  }

  async validateCodeEnViaRNCP(rncp_code, codeEn) {
    let formation = new Formation({ rncp_code });
    await formation.save();

    const { run: runRncpReverse } = require(`../../../../rncpToCodeEn/src/index`);
    await runRncpReverse({ query: { _id: formation._id } });

    formation = await Formation.findOne({ _id: formation._id });
    await Formation.findOneAndRemove({ _id: formation._id });

    if (formation.educ_nat_code === codeEn) {
      this.stats.code_RNCP_give_same_codeEn_yes++;
    } else {
      this.stats.code_RNCP_give_same_codeEn_no++;
    }
  }
}

const rcoChecker = new RcoChecker();
module.exports = rcoChecker;
