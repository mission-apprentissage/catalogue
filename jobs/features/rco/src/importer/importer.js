const wsRCO = require("./wsRCO");
const { RcoFormations } = require("../../../../../common/models2");
const { diff } = require("deep-object-diff");
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;

class Importer {
  constructor() {
    this.added = [];
    this.updated = [];
  }

  async run() {
    const formationsJ1 = await wsRCO.getRCOcatalogue("-j-1");
    const formations = await wsRCO.getRCOcatalogue();
    await this.start(formations, formationsJ1);
  }

  async start(formations, formationsJ1) {
    try {
      const collection = this.lookupDiff(formations, formationsJ1);

      if (!collection) {
        return null;
      }

      let formationsToAddToDb = [];
      let formationsToUpdateToDb = [];

      const addedFormations = await this.addedFormationsHandler(collection.added);
      formationsToAddToDb = [...formationsToAddToDb, ...addedFormations.toAddToDb];
      formationsToUpdateToDb = [...formationsToUpdateToDb, ...addedFormations.toUpdateToDb];

      //  ---------------------------------------------------- UPDATE
      // await asyncForEach(collection.updated, async rcoFormationUpdated => {
      //   const rcoFormation = await this.getRcoFormation(rcoFormationUpdated);
      //   if (rcoFormation) {
      //     const updates = this.diffRcoFormation(rcoFormation, rcoFormationUpdated);
      //     console.log(updates);
      //     // await RcoFormations.findOneAndUpdate(
      //     //   { _id: rcoFormation._id },
      //     //   {
      //     //     ...eta,
      //     //     ...updateInfo,
      //     //     last_update_at: Date.now(),
      //     //   },
      //     //   { new: true }
      //     // );
      //   } else {
      //     // ISSUE!
      //   }
      // });

      // ---------------------------------------------------- DELETE
      // TODO Delete cases
      // Desactiver la formations

      await asyncForEach(formationsToAddToDb, async formationToAddToDb => {
        await this.addRCOFormation(formationToAddToDb);
      });
      await asyncForEach(formationsToUpdateToDb, async formationToUpdateToDb => {
        await this.updateRCOFormation(formationToUpdateToDb.rcoFormation, formationToUpdateToDb.updateInfo);
      });

      // Stats
      console.log(collection.added.length);
      console.log(this.added.length);
      console.log(this.updated.length);
      // console.log(collection.updated.length);
    } catch (error) {
      console.log(error);
    }
  }

  /*
   * Handler added formation
   */
  async addedFormationsHandler(added) {
    const toAddToDb = [];
    const toUpdateToDb = [];

    if (!added) {
      return {
        toAddToDb,
        toUpdateToDb,
      };
    }

    await asyncForEach(added, async rcoFormationAdded => {
      const rcoFormation = await this.getRcoFormation(rcoFormationAdded);

      // The formation does not already exist
      if (!rcoFormation) {
        toAddToDb.push(rcoFormationAdded);
      } else if (!rcoFormation.published) {
        // Réactiver la formation
        const updateInfo = {
          published: true,
        };
        // Compare old with new one
        const updates = this.diffRcoFormation(rcoFormation, rcoFormationAdded);
        if (updates) {
          // TODO   ADD DIFF TO  updateInfo ----------------------------------------------------
          console.log(updates);
        }
        toUpdateToDb.push({ rcoFormation, updateInfo });
      } else {
        // ISSUE! ----------------------------------------------------
      }
    });

    return {
      toAddToDb,
      toUpdateToDb,
    };
  }

  /*
   * Comparing collections to find diff
   */
  lookupDiff(currentFormations, pastFormations) {
    const added = [];
    const updated = [];
    const deleted = [];

    for (let ite = 0; ite < currentFormations.length; ite++) {
      const formation = currentFormations[ite];
      const id = this._buildId(formation);
      const found = pastFormations.find(pf => id === this._buildId(pf));

      // Some formations has been added
      if (!found) {
        added.push(formation);
      } else {
        const compare = diff(formation, found);
        const keys = Object.keys(compare);
        // Some formations has been updated
        if (keys.length !== 0) {
          updated.push(formation);
        }
      }
    }

    if (currentFormations.length < pastFormations.length) {
      // Some formations has been deleted
      for (let ite = 0; ite < pastFormations.length; ite++) {
        const pastFormation = pastFormations[ite];
        const id = this._buildId(pastFormation);
        const found = currentFormations.find(f => id === this._buildId(f));
        if (!found) {
          deleted.push(pastFormation);
        }
      }
    }

    // No modifications
    if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
      return null;
    }

    return {
      added,
      updated,
      deleted,
    };
  }

  /*
   * Build uniq identifier per rco formation
   */
  _buildId(formation) {
    return `${formation.id_formation} ${formation.id_action} ${formation.id_certifinfo}`;
  }

  /*
   * get RCO Formation
   */
  async getRcoFormation(formation) {
    const rcoFormation = await RcoFormations.findOne({
      id_formation: formation.id_formation,
      id_action: formation.id_action,
      id_certifinfo: formation.id_certifinfo,
    });
    if (!rcoFormation) {
      return null;
    }
    return rcoFormation.toObject();
  }

  /*
   * Add to db RCO Formation
   */
  async addRCOFormation(rcoFormation) {
    const newRcoFormation = new RcoFormations(rcoFormation);
    await newRcoFormation.save();
    const id = this._buildId(newRcoFormation);
    this.added.push({ mnaId: newRcoFormation._id, rcoId: id });
    return newRcoFormation._id;
  }

  /*
   * Update to db RCO Formation
   */
  async updateRCOFormation(rcoFormation, updateInfo) {
    const updates_history = [...rcoFormation.updates_history, { ...updateInfo, last_update_at: Date.now() }];
    await RcoFormations.findOneAndUpdate(
      { _id: rcoFormation._id },
      {
        ...rcoFormation,
        ...updateInfo,
        updates_history,
        last_update_at: Date.now(),
      },
      { new: true }
    );
    const id = this._buildId(rcoFormation);
    this.updated.push({ mnaId: rcoFormation._id, rcoId: id });
    return rcoFormation._id;
  }

  /*
   * diff RCO Formation
   */
  diffRcoFormation(rcoFormationP, formation) {
    const rcoFormation = { ...rcoFormationP };
    delete rcoFormation._id;
    delete rcoFormation.__v;
    const compare = diff(rcoFormation, formation);
    const keys = Object.keys(compare);

    if (keys.length === 0) {
      return null;
    }

    return compare;
  }
}

const importer = new Importer();
module.exports = importer;
