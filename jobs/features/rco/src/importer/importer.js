const wsRCO = require("./wsRCO");
const { RcoFormations } = require("../../../../../common/models2");
const { diff } = require("deep-object-diff");
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;

class Importer {
  constructor() {}

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

      const { addedToDb, updatedToDb } = await this.checkFormationsToAddToDb(collection.added);

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

      // TODO Delete cases
      // Desactiver la formations

      // Stats
      console.log(collection.added.length);
      console.log(addedToDb.length);
      console.log(updatedToDb.length);
      // console.log(collection.updated.length);
    } catch (error) {
      console.log(error);
    }
  }

  async checkFormationsToAddToDb(added) {
    const addedToDb = [];
    const updatedToDb = [];

    if (!added) {
      return {
        addedToDb,
        updatedToDb,
      };
    }

    await asyncForEach(added, async rcoFormationAdded => {
      const rcoFormation = await this.getRcoFormation(rcoFormationAdded);

      // The formation does not already exist
      if (!rcoFormation) {
        const newRcoFormation = new RcoFormations(rcoFormationAdded);
        await newRcoFormation.save();
        const id = this._buildId(newRcoFormation);
        addedToDb.push({ mnaId: newRcoFormation._id, rcoId: id });
      } else if (!rcoFormation.published) {
        // Réactiver la formation
        const updateInfo = {
          published: true,
        };
        // Compare old with new one
        const updates = this.diffRcoFormation(rcoFormation, rcoFormationAdded);
        if (updates) {
          // TODO
          console.log(updates);
        }
        await this.updateRCOFormation(rcoFormation, updateInfo);
        const id = this._buildId(rcoFormation);
        updatedToDb.push({ mnaId: rcoFormation._id, rcoId: id });
      } else {
        // ISSUE!
      }
    });

    return {
      addedToDb,
      updatedToDb,
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
   * Update RCO Formation
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
