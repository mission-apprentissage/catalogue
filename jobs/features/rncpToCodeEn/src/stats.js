const { connectToMongo, closeMongoConnection } = require("../../../../common/mongo");
const { Formation } = require("../../../../common/models2");

const run = async () => {
  try {
    await connectToMongo();
    const nbFormationsTotal = await Formation.countDocuments({});

    const formationsAvecRncp = await Formation.find({ rncp_code: { $nin: [null, ""] } });
    const formationsSansRncp = await Formation.find({ rncp_code: { $in: [null, ""] } });

    const formationsAvecCodeEducNat = await Formation.find({ educ_nat_code: { $nin: [null, ""] } });
    const formationsSansCodeEducNat = await Formation.find({ educ_nat_code: { $in: [null, ""] } });

    const formationsAvecRncpEtCodeEducNat = await Formation.find({
      $and: [{ rncp_code: { $nin: [null, ""] } }, { educ_nat_code: { $nin: [null, ""] } }],
    });
    const formationsAvecRncpEtSansCodeEducNat = await Formation.find({
      $and: [{ rncp_code: { $nin: [null, ""] } }, { educ_nat_code: { $in: [null, ""] } }],
    });
    const formationsSansRncpEtAvecCodeEducNat = await Formation.find({
      $and: [{ rncp_code: { $in: [null, ""] } }, { educ_nat_code: { $nin: [null, ""] } }],
    });
    const formationsSansRncpEtSansCodeEducNat = await Formation.find({
      $and: [{ rncp_code: { $in: [null, ""] } }, { educ_nat_code: { $in: [null, ""] } }],
    });

    const stats = {
      nbFormationsTotal,
      nbFormationsAvecRncp: formationsAvecRncp.length,
      nbFormationsSansRncp: formationsSansRncp.length,
      nbFormationsAvecCodeEducNat: formationsAvecCodeEducNat.length,
      nbFormationsSansCodeEducNat: formationsSansCodeEducNat.length,
      nbFormationsAvecRncpEtCodeEducNat: formationsAvecRncpEtCodeEducNat.length,
      nbFormationsAvecRncpEtSansCodeEducNat: formationsAvecRncpEtSansCodeEducNat.length,
      NbFormationsSansRncpEtAvecCodeEducNat: formationsSansRncpEtAvecCodeEducNat.length,
      NbFormationsSansRncpEtSansCodeEducNat: formationsSansRncpEtSansCodeEducNat.length,
    };

    console.log(stats);
    await closeMongoConnection();
  } catch (err) {
    console.log(err);
  }
};

run();
