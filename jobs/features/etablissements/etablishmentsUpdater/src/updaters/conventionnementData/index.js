const etablissementsChecker = require("./EtablissementsChecker");
const { computeCodes, infosCodes, datadockValue } = require("./constants/EtablissementsConstants");

class ConventionnementData {
  constructor() {}

  getUpdates(establishment) {
    const filesInfos = this.getFilesInfos(establishment);
    const conventionnementInfos = this.conventionnement(establishment, filesInfos);

    // TODO case no update

    return {
      ...filesInfos,
      ...conventionnementInfos,
      computed_info_datadock: datadockValue[filesInfos.info_datadock],
    };
  }

  getFilesInfos(establishment) {
    return {
      info_depp: etablissementsChecker.getInfoDepp(establishment),
      info_dgefp: etablissementsChecker.getInfoDGEFP(establishment),
      info_datadock: etablissementsChecker.getInfoDataDock(establishment),
      info_datagouv_ofs: etablissementsChecker.getInfoDataGouv(establishment),
    };
  }

  conventionnement(establishment, filesInfos) {
    const result = {
      computed_type: computeCodes.type.ToCheck,
      computed_conventionne: computeCodes.conventionne.No,
      computed_declare_prefecture: computeCodes.declarePrefecture.No,
      published: true,
    };

    // Check In DEPP
    if (filesInfos.info_depp === infosCodes.infoDEPP.Found) {
      // Case in DEPP -> CFA + Conventionne
      result.computed_type = computeCodes.type.CFA;
      result.computed_conventionne = computeCodes.conventionne.Yes;
    }

    // Check DGEFP Siret / Siren
    if (
      filesInfos.info_dgefp === infosCodes.infoDGEFP.SirenMatch ||
      filesInfos.info_dgefp === infosCodes.infoDGEFP.SiretMatch ||
      filesInfos.info_dgefp === infosCodes.infoDGEFP.SiretSiegeSocialMatch ||
      filesInfos.info_datagouv_ofs === infosCodes.infoDATAGOUV.Found
    ) {
      // Case in DGEFP or DataGouv -> CFA + Declare Prefecture
      result.computed_type = computeCodes.type.CFA;
      result.computed_declare_prefecture = computeCodes.declarePrefecture.Yes;
    } else {
      result.computed_declare_prefecture = computeCodes.declarePrefecture.No;

      if (result.computed_type !== computeCodes.type.CFA) {
        // Check Déclaré DS
        if (establishment.ds_questions_has_agrement_cfa !== "false") {
          result.computed_type = computeCodes.type.ToCheck;
        } else {
          result.computed_type = computeCodes.type.OF;
        }
      }
    }

    // Check if can be published
    if (
      result.computed_conventionne === computeCodes.conventionne.No &&
      result.computed_declare_prefecture === computeCodes.declarePrefecture.No
    ) {
      // To Remove Trainings - Établissements can't be in EducNat SI
      result.published = false;
    }

    return result;
  }
}

const conventionnementData = new ConventionnementData();
module.exports = conventionnementData;
