const wsRCO = require("./wsRCO");
const { RcoFormations } = require("../../../../../common/models2");
const { diff } = require("deep-object-diff");
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const report = require("./report");

class Importer {
  constructor() {
    this.added = [];
    this.updated = [];
    this.formationsToAddToDb = [];
    this.formationsToUpdateToDb = [];
  }

  async run() {
    const formationsJ1 = await wsRCO.getRCOcatalogue("-j-1");
    const formations = await wsRCO.getRCOcatalogue();
    await this.start(formations, []); // formationsJ1
  }

  async start(formations, formationsJ1) {
    try {
      const collection = this.lookupDiff(formations, formationsJ1);

      if (!collection) {
        return null;
      }

      const addedFormations = await this.addedFormationsHandler(collection.added);
      this.addtoDbTasks(addedFormations);

      const updatedFormations = await this.updatedFormationsHandler(collection.updated);
      this.addtoDbTasks(updatedFormations);

      // Desactiver la formations
      const deletedFormations = await this.deletedFormationsHandler(collection.deleted);
      this.addtoDbTasks(deletedFormations);

      await this.dbOperationsHandler();

      await this.report(collection);
    } catch (error) {
      console.log(error);
    }
  }

  async report(collection = null) {
    if (this.updated.length > 0) {
      for (let ite = 0; ite < this.updated.length; ite++) {
        const element = this.updated[ite];
        const { updates, updateInfo } = this.formationsToUpdateToDb.find(u => u.rcoFormation._id === element.mnaId);

        element.updates = JSON.stringify(updates);

        if (updateInfo.published === true) {
          element.published = "Re-ouverte";
        } else if (updateInfo.published === false) {
          element.published = "Supprimée";
        }

        // const rcoFormation = await RcoFormations.findById(element.mnaId);
        // const updates_history = rcoFormation.updates_history[rcoFormation.updates_history.length - 1];
        // element.from = JSON.stringify(updates_history.from);
        // element.to = JSON.stringify(updates_history.to);
      }
    }

    await report.generate(collection, this.added, this.updated);
  }

  /*
   * Reset report
   */
  resetReport() {
    this.formationsToAddToDb = [];
    this.formationsToUpdateToDb = [];
    this.added = [];
    this.updated = [];
  }

  /*
   * Handler db operations
   */
  async dbOperationsHandler() {
    await asyncForEach(this.formationsToAddToDb, async formationToAddToDb => {
      await this.addRCOFormation(formationToAddToDb);
    });
    await asyncForEach(this.formationsToUpdateToDb, async formationToUpdateToDb => {
      await this.updateRCOFormation(formationToUpdateToDb.rcoFormation, formationToUpdateToDb.updateInfo);
    });
  }

  /*
   * Add db tasks
   */
  addtoDbTasks(resultFormations) {
    this.formationsToAddToDb = [...this.formationsToAddToDb, ...resultFormations.toAddToDb];
    this.formationsToUpdateToDb = [...this.formationsToUpdateToDb, ...resultFormations.toUpdateToDb];
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
        let updateInfo = {
          published: true,
        };
        // Compare old with new one
        const { updates, keys } = this.diffRcoFormation(rcoFormation, rcoFormationAdded);
        if (updates) {
          // prepare update
          for (let ite = 0; ite < keys.length; ite++) {
            const key = keys[ite];
            updateInfo[key] = rcoFormationAdded[key];
          }
        }
        toUpdateToDb.push({ rcoFormation, updateInfo, updates });
      } else {
        console.error(
          `addedFormationsHandler >> Formation ${this._buildId(rcoFormationAdded)} existe et est plublié ${
            rcoFormation._id
          }`
        );
      }
    });

    return {
      toAddToDb,
      toUpdateToDb,
    };
  }

  /*
   * Handler updated formation
   */
  async updatedFormationsHandler(updated) {
    const toUpdateToDb = [];

    if (!updated) {
      return {
        toAddToDb: [],
        toUpdateToDb,
      };
    }

    await asyncForEach(updated, async rcoFormationUpdated => {
      const rcoFormation = await this.getRcoFormation(rcoFormationUpdated);

      // The formation does exist
      if (rcoFormation) {
        let updateInfo = {};
        // Compare old with new one
        const { updates, keys } = this.diffRcoFormation(rcoFormation, rcoFormationUpdated);
        if (updates) {
          // prepare update
          for (let ite = 0; ite < keys.length; ite++) {
            const key = keys[ite];
            updateInfo[key] = rcoFormationUpdated[key];
          }
        }
        toUpdateToDb.push({ rcoFormation, updateInfo, updates });
      } else {
        console.error(
          `updatedFormationsHandler >> Formation ${this._buildId(rcoFormationUpdated)} n'existe pas en base`
        );
      }
    });

    return {
      toAddToDb: [],
      toUpdateToDb,
    };
  }

  /*
   * Handler deleted formation
   */
  async deletedFormationsHandler(deleted) {
    const toUpdateToDb = [];

    if (!deleted) {
      return {
        toAddToDb: [],
        toUpdateToDb,
      };
    }
    await asyncForEach(deleted, async rcoFormationDeleted => {
      const rcoFormation = await this.getRcoFormation(rcoFormationDeleted);

      // The formation does exist
      if (rcoFormation) {
        let updateInfo = {
          published: false,
        };
        // Compare old with new one
        const { updates, keys } = this.diffRcoFormation(rcoFormation, rcoFormationDeleted);
        if (updates) {
          // prepare update
          for (let ite = 0; ite < keys.length; ite++) {
            const key = keys[ite];
            updateInfo[key] = rcoFormationDeleted[key];
          }
        }
        toUpdateToDb.push({ rcoFormation, updateInfo, updates });
      }
    });

    return {
      toAddToDb: [],
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
    const added = { mnaId: newRcoFormation._id, rcoId: id };
    this.added.push(added);
    return added;
  }

  /*
   * Update to db RCO Formation
   */
  async updateRCOFormation(rcoFormation, updateInfo) {
    const updates_history = this.buildUpdatesHistory(rcoFormation, updateInfo);
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
    const updated = { mnaId: rcoFormation._id, rcoId: id };
    this.updated.push(updated);
    return updated;
  }

  /*
   * Build updates history
   */
  buildUpdatesHistory(rcoFormation, updateInfo) {
    let from = {};
    const keys = Object.keys(updateInfo);
    for (let ite = 0; ite < keys.length; ite++) {
      const key = keys[ite];
      from[key] = rcoFormation[key];
    }
    const updates_history = [...rcoFormation.updates_history, { from, to: { ...updateInfo }, updated_at: Date.now() }];
    return updates_history;
  }

  /*
   * diff RCO Formation
   */
  diffRcoFormation(rcoFormationP, formation) {
    const rcoFormation = { ...rcoFormationP };
    delete rcoFormation._id;
    delete rcoFormation.__v;
    delete rcoFormation.updates_history;
    delete rcoFormation.published;
    delete rcoFormation.created_at;
    delete rcoFormation.last_update_at;
    const compare = diff(rcoFormation, formation);
    const keys = Object.keys(compare);

    if (keys.length === 0) {
      return { updates: null, keys: 0 };
    }

    return { updates: compare, keys };
  }
}

const importer = new Importer();
module.exports = importer;
