// #region Imports

const { PATH_RCO_EXPORT, PATH_RCO_EXPORT_OLD } = require("./Constants");
//const api = require("../../../../../../common/api");
const { connectToMongo, closeMongoConnection } = require("../../../../../../common/mongo");
const { Formation, Establishment } = require("../../../../../../common/models2");
const asyncForEach = require("../../../../../common-jobs/utils").asyncForEach;
// const { filter, find } = require("lodash");
const fileManager = require("./FileManager");
const uniqWith = require("lodash").uniqWith;

// #endregion

class RcoChecker {
  constructor() {
    this.baseRCO = fileManager.getDataRcoFromFile(PATH_RCO_EXPORT, "new");
    this.baseRCOold = fileManager.getDataRcoFromFile(PATH_RCO_EXPORT_OLD, "old");
    this.stats = {
      total: this.baseRCO.length,
      totalOld: this.baseRCOold.length,
      etablissements_found: 0,
      codeEn_error_bcn: 0,
      codeEn_Ok_bcn: 0,
      notMNA_codeEn_error_bcn: 0,
      notMNA_codeEn_Ok_bcn: 0,
      no_uai_rco: 0,
      uai_rco_found_etablissements: 0,
      uai_rco_not_found_etablissements: 0,
      rncp_found_and_equal: 0,
      rncp_found_no_equal: 0,
      rncp_not_found: 0,
      notMNA_rncp_found_and_equal: 0,
      notMNA_rncp_not_found: 0,
      notMNA_rncp_found_no_equal: 0,
      training_found_in_catalogue: 0,
      training_not_found_in_catalogue: 0,
      code_RNCP_give_same_codeEn_yes: 0,
      code_RNCP_give_same_codeEn_no: 0,
      notMNA_no_uai_rco: 0,
      notMNA_uai_rco_found_etablissements: 0,
      notMNA_uai_rco_not_found_etablissements: 0,
    };
  }

  async run() {
    const uniqSiretNotFound = [];
    const uniqSiret = [];
    let countLinesSiretNotFound = 0;

    const newNumFO = this.baseRCO.map(i => i.numeroFO);
    const oldNumFO = this.baseRCOold.map(i => i.numeroFO);
    let countFo = 0;
    for (let i = 0; i < newNumFO.length; i++) {
      const newFo = newNumFO[i];
      for (let j = 0; j < oldNumFO.length; j++) {
        const oldFo = oldNumFO[j];
        if (newFo === oldFo) {
          countFo++;
        }
      }
    }
    console.log(countFo);

    await connectToMongo();
    await asyncForEach(this.baseRCO, async rcoItem => {
      // Look for existing etablissement
      let etablissement_responsable = await Establishment.findOne({ siret: rcoItem.siret_CFA_OFA });
      let etablissement_formateur = await Establishment.findOne({ siret: rcoItem.siret_formateur });
      //Establishment.find({siret : { $in : [rcoItem.siret_CFA_OFA, rcoItem.siret_formateur]}}
      if (!etablissement_responsable) {
        if (uniqSiretNotFound.indexOf(rcoItem.siret_CFA_OFA) === -1) {
          uniqSiretNotFound.push(rcoItem.siret_CFA_OFA);
        }
        countLinesSiretNotFound++;
      }
      if (!etablissement_formateur) {
        if (uniqSiretNotFound.indexOf(rcoItem.siret_formateur) === -1) {
          uniqSiretNotFound.push(rcoItem.siret_formateur);
        }
        if (rcoItem.siret_CFA_OFA !== rcoItem.siret_formateur) {
          countLinesSiretNotFound++;
        }
      }

      if (uniqSiret.indexOf(rcoItem.siret_formateur) === -1) {
        uniqSiret.push(rcoItem.siret_formateur);
      }
      if (uniqSiret.indexOf(rcoItem.siret_CFA_OFA) === -1) {
        uniqSiret.push(rcoItem.siret_CFA_OFA);
      }
    });
    closeMongoConnection();
    const itemsCase = [];
    await connectToMongo();

    await asyncForEach(this.baseRCO, async rcoItem => {
      // Look for existing etablissement
      let etablissement_responsable = await Establishment.findOne({ siret: rcoItem.siret_CFA_OFA });
      let etablissement_formateur = await Establishment.findOne({ siret: rcoItem.siret_formateur });

      if (etablissement_responsable && etablissement_formateur) {
        if (rcoItem.codeEducNat && rcoItem.codeRNCP) {
          itemsCase.push(rcoItem);
          this.stats.etablissements_found++;

          let notFoundInMNA = false;
          const lookup = await Formation.findOne({
            educ_nat_code: `${rcoItem.codeEducNat}`,
            code_postal: rcoItem.codePostal,

            //etablissement_formateur_siret: coItem.siret_formateur,
            etablissement_responsable_siret: rcoItem.siret_CFA_OFA,
          });
          if (lookup) {
            this.stats.training_found_in_catalogue++;
            // SI TROUVER COMPARÉ
          } else {
            this.stats.training_not_found_in_catalogue++;
            notFoundInMNA = true;
          }

          let formation = new Formation({
            educ_nat_code: `${rcoItem.codeEducNat}`,
            //uai_formation: rcoItem.uai,
            code_postal: rcoItem.codePostal,
            etablissement_formateur_siret: rcoItem.siret_formateur,
            etablissement_responsable_siret: rcoItem.siret_CFA_OFA,
          });
          await formation.save();

          const { run: trainingsUpdater } = require(`../../../../formations/trainingsUpdater/src/trainingsUpdater`);
          await trainingsUpdater({ _id: formation._id }, false);

          const { run: runRncpReverse } = require(`../../../../rncpToCodeEn/src/index`);
          await runRncpReverse({ query: { _id: formation._id }, mode: "findCodeRNCP" }, false);

          formation = await Formation.findOne({ _id: formation._id });

          await Formation.findOneAndRemove({ _id: formation._id });

          if (formation.info_bcn_code_en === 0 || formation.info_bcn_code_en === 1) {
            this.stats.codeEn_error_bcn++;
            if (notFoundInMNA) this.stats.notMNA_codeEn_error_bcn++;
          } else {
            this.stats.codeEn_Ok_bcn++;
            if (notFoundInMNA) this.stats.notMNA_codeEn_Ok_bcn++;
          }

          if (formation.rncp_code && formation.rncp_code === `RNCP${rcoItem.codeRNCP}`) {
            this.stats.rncp_found_and_equal++;
            if (notFoundInMNA) this.stats.notMNA_rncp_found_and_equal++;
          } else {
            if (!formation.rncp_code) {
              this.stats.rncp_not_found++;
              if (notFoundInMNA) this.stats.notMNA_rncp_not_found++;
            } else {
              this.stats.rncp_found_no_equal++;
              if (notFoundInMNA) this.stats.notMNA_rncp_found_no_equal++;
            }
          }

          if (!rcoItem.uai) {
            this.stats.no_uai_rco++;
            if (notFoundInMNA) this.stats.notMNA_no_uai_rco++;
          } else {
            if ([etablissement_responsable.uai, etablissement_formateur.uai].includes(rcoItem.uai)) {
              this.stats.uai_rco_found_etablissements++;
              if (notFoundInMNA) this.stats.notMNA_uai_rco_found_etablissements++;
            } else {
              this.stats.uai_rco_not_found_etablissements++;
              if (notFoundInMNA) this.stats.notMNA_uai_rco_not_found_etablissements++;
            }
          }

          await this.validateCodeEnViaRNCP(`RNCP${rcoItem.codeRNCP}`, `${rcoItem.codeEducNat}`);
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
    });
    closeMongoConnection();

    console.log(itemsCase.length);
    const uniqItems = uniqWith(itemsCase, (a, b) => {
      if (
        a.codeEducNat === b.codeEducNat &&
        a.codePostal === b.codePostal &&
        a.siret_formateur === b.siret_formateur &&
        a.siret_CFA_OFA === b.siret_CFA_OFA &&
        a.codeRNCP === b.codeRNCP
      ) {
        return false;
      }
      return true;
    });
    console.log(uniqItems.length);

    console.log(uniqSiret.length);
    console.log(uniqSiretNotFound.length);
    console.log(countLinesSiretNotFound);

    //this.stats.siret_not_found_unique = uniqSiret.length;
    console.log(this.stats);
  }

  async validateSiret(siret) {
    let etablissement = new Establishment({ siret });
    await etablissement.save();
    const {
      run: etablishmentsUpdater,
    } = require(`../../../../etablissements/etablishmentsUpdater/src/etablishmentsUpdater`);
    await etablishmentsUpdater({ _id: etablissement._id }, false);
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
    await runRncpReverse({ query: { _id: formation._id }, mode: "findCodeEn" }, false);

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
