// #region Imports

const mappingConstants = require("../Constants/MappingConstants");
// const getLocationInfo = require("../../services/utils").getLocationInfo;
const find = require("lodash").find;
const fs = require("fs-extra");
const path = require("path");

// #endregion

class FormatingModel {
  constructor() {
    this.academiesCommunes = [];
  }

  // #region Main Format Methods

  format(item, etablissementR, etablissementF, formatPeriode, formatNiveau) {
    let result = this.formatField(item, formatPeriode, formatNiveau);
    this.addFieldsToTraining(result, etablissementR, etablissementF);
    return result;
  }

  formatField(item, formatPeriode, formatNiveau) {
    try {
      const result = {
        ds_id_dossier: item.ds_id_dossier,
        etablissement_responsable_siret: this.formatSiret_CFA_OFA(item.etablissement_responsable_siret),
        etablissement_formateur_siret: this.formatSiret_formateur(item.etablissement_formateur_siret),
        siren: this.formatSiren(item.siren),
        source: this.formatSource(item.source),
        nom: this.formatNom(item.nom),
        diplome: this.formatDiplome(item.diplome),
        intitule: this.formatIntitule(item.intitule),
        educ_nat_code: this.formatCodeEducNat(item.codeEducNat),
        niveau: formatNiveau ? this.formatNiveau(item.niveau) : this.formatNiveauToStr(item.niveau),
        periode: formatPeriode ? this.formatPeriode(item.periode) : this.formatPeriodeToStr(item.periode),
        capacite: this.formatCapacite(item.capacite),
        email: this.formatEmail(item.email),
        uai_formation: this.formatUai(item.uai),
        code_postal: this.formatCodePostal(item.codePostal),
        num_academie: this.formatNumAcademie(item.num_academie),

        nom_academie: this.formatNomAcademie(item.nom_academie),
        num_departement: this.formatNumDepartement(item.codePostal),
        code_commune_insee: null,
        commentaires: this.formatCommentaires(item.commentaires),
        last_modification: this.formatModification(item.modification),
        published_old: item.published_old,
        to_verified: item.to_verified,
        parcoursup_reference: item.parcoursup_reference,
      };

      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  // #endregion

  // #region Fields Formatting Logic Methods

  formatSiret_CFA_OFA(siret_CFA_OFA) {
    return siret_CFA_OFA ? `${siret_CFA_OFA}`.trim() : null;
  }

  formatSiret_formateur(siret_formateur) {
    return siret_formateur ? `${siret_formateur}`.trim() : null;
  }

  formatSiren(siren) {
    return siren ? `${siren}`.trim() : null;
  }

  formatSource(source) {
    return source ? `${source}`.trim() : null;
  }

  formatNom(nom) {
    return nom ? `${nom}`.trim() : null;
  }

  formatDiplome(diplome) {
    return diplome ? `${diplome}`.trim() : null;
  }

  formatIntitule(intitule) {
    return intitule ? `${intitule}`.trim() : null;
  }

  formatCodeEducNat(codeEducNat) {
    return codeEducNat ? `${codeEducNat}`.trim().replace(/\s/g, "") : null;
  }

  formatStrictCodeEducNat(codeEducNat) {
    const regex = /^[A-Z0-9]{8}$/;
    if (codeEducNat.toUpperCase().match(regex)) {
      return codeEducNat.toUpperCase();
    } else {
      return "";
    }
  }

  formatNiveau(niveau) {
    if (!niveau) {
      return "";
    }
    let formatedNiveau = `${niveau}`.trim();
    if (!isNaN(formatedNiveau)) {
      const toText = mappingConstants.niveaux[parseInt(formatedNiveau) - 3];
      if (!toText) {
        console.log("error formatNiveau", formatedNiveau);
        return `${formatedNiveau}`; // TODO Clean Handle niveau error
      }
      formatedNiveau = toText;
    }

    return formatedNiveau.replace("…", "...");
  }

  formatNiveauToStr(niveau) {
    return niveau ? `${niveau}`.trim() : null;
  }

  formatPeriode(periode) {
    let formatedPeriode = periode ? `${periode}`.trim() : null;

    if (!formatedPeriode) return formatedPeriode;

    try {
      const test = eval(formatedPeriode);
      if (!Array.isArray(test)) {
        formatedPeriode = this.convertPeriodeStringToArray(formatedPeriode);
      }
    } catch (error) {
      formatedPeriode = this.convertPeriodeStringToArray(formatedPeriode);
    }

    return formatedPeriode.replace(/\s/g, "");
  }

  formatPeriodeToStr(periode) {
    return periode ? `${periode}`.trim() : null;
  }

  convertPeriodeStringToArray(periodeNum) {
    const res = periodeNum
      .replace(/10|11|12|01|02|03|04|05|06|07|08|09|1|2|3|4|5|6|7|8|9/gi, m => {
        return `"${mappingConstants.mois[parseInt(m) - 1]}"`;
      })
      .replace(/,/gi, ", ")
      .replace(/-/gi, ", ")
      .replace(/;/gi, ", ")
      .replace(/\./gi, ", ");

    return `[${res}]`;
  }

  formatCapacite(capacite) {
    return capacite ? `${capacite}`.trim() : null;
  }

  formatEmail(email) {
    return email ? `${email}`.trim() : null;
  }

  formatUai(uai) {
    return uai ? `${uai}`.trim().toUpperCase() : null;
  }

  formatCodePostal(codePostal) {
    return codePostal ? `${codePostal}`.trim() : null;
  }

  // formatLocation(item) {
  //   item.codePostal = this.formatCodePostal(item.codePostal);
  //   item.codeCommuneInsee = this.formatCodeCommuneInsee(item.codeCommuneInsee);
  //   const locationInfo = getLocationInfo(item.codePostal);

  //   if (!locationInfo) {
  //     return {
  //       codePostal: item.codePostal,
  //       codeCommuneInsee: item.codeCommuneInsee,
  //     };
  //   }

  //   return locationInfo;
  // }

  formatCodeCommuneInsee(codeCommuneInsee) {
    return codeCommuneInsee ? `${codeCommuneInsee}`.trim() : null;
  }

  formatNumAcademie(numAcademie) {
    return numAcademie ? `${numAcademie}`.trim() : null;
  }

  formatNomAcademie(nomAcademie) {
    return nomAcademie ? `${nomAcademie}`.trim() : null;
  }

  formatNumDepartement(codePostal) {
    const cp = this.formatCodePostal(codePostal);
    return cp !== "" ? cp.substring(0, 2) : null;
  }

  formatCommentaires(commentaires) {
    return commentaires ? `${commentaires}`.trim() : null;
  }

  formatModification(modification) {
    return modification ? `${modification}`.trim() : null;
  }

  // #endregion

  /**
   * Add fields
   */
  addFieldsToTraining(formation, etablissementR, etablissementF) {
    formation.etablissement_formateur_id = etablissementF._id;

    formation.etablissement_responsable_siret_intitule = null;
    formation.etablissement_formateur_siret_intitule = null;

    // Get Academie from numAcademie
    formation.nom_academie = null;
    if (formation.num_academie) {
      const numAcademieInt = Number.parseInt(formation.num_academie);
      const academieForNum = this.getAcademieFromNumAcademie(numAcademieInt);
      formation.nom_academie = academieForNum ? academieForNum.nomAcademie : "NC";
    }

    // Get Academie from formation code insee for default value
    formation.num_academie_siege = "NC";
    formation.nom_academie_siege = "NC";

    // Intitules Organismes CFA
    if (etablissementR) {
      formation.etablissement_responsable_id = etablissementR._id;
      formation.etablissement_responsable_siret_intitule = etablissementR.nom_commercial
        ? etablissementR.nom_commercial
        : etablissementR.raison_sociale
        ? etablissementR.raison_sociale
        : null;

      // Get Academie from organisme code insee
      const academieForCodeOrganisme = this.getAcademieFromCodeInsee(etablissementR.code_insee_localite);
      formation.num_academie_siege = academieForCodeOrganisme ? academieForCodeOrganisme.numAcademie : "NC";
      formation.nom_academie_siege = academieForCodeOrganisme ? academieForCodeOrganisme.nomAcademie : "NC";
    }

    // Intitules Organismes Formateur
    if (etablissementF) {
      formation.etablissement_formateur_siret_intitule = etablissementF.nom_commercial
        ? etablissementF.nom_commercial
        : etablissementF.raison_sociale
        ? etablissementF.raison_sociale
        : null;
    }

    // Format code educ nat
    //formation.codeEducNat = this.formatStrictCodeEducNat(formation.codeEducNat);
  }

  getAcademieFromNumAcademie(numAcademieToSearch) {
    if (this.academiesCommunes.length === 0) {
      this.academiesCommunes = fs.readJsonSync(path.join(__dirname, "../assets/AcademiesCommunes.json"));
    }
    return find(this.academiesCommunes, { numAcademie: numAcademieToSearch });
  }

  getAcademieFromCodeInsee(code_commune_insee) {
    if (this.academiesCommunes.length === 0) {
      this.academiesCommunes = fs.readJsonSync(path.join(__dirname, "../assets/AcademiesCommunes.json"));
    }
    return find(this.academiesCommunes, { commune: code_commune_insee });
  }

  // #endregion
}

const formatingModel = new FormatingModel();
module.exports = formatingModel;
