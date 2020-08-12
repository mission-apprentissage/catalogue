const { connectToMongo } = require("../../../../common/mongo");
const { Formation } = require("../../../../common/models2");

const run = async () => {
  try {
    await connectToMongo();
    const nbFormationsTotal = await Formation.countDocuments({});
    const formationsAvecRncp = await Formation.find({ rncp_code: { $nin: [null, ""] } });
    const formationsSansRncp = await (await Formation.find({ rncp_code: { $in: [null, ""] } })).length;
    const formationsAvecCodeEducNat = await (await Formation.find({ educ_nat_code: { $nin: [null, ""] } })).length;
    const formationsSansCodeEducNat = await (await Formation.find({ educ_nat_code: { $in: [null, ""] } })).length;

    const formationsAvecRncpEtCodeEducNat = await (
      await Formation.find({
        $and: [{ rncp_code: { $nin: [null, ""] } }, { educ_nat_code: { $nin: [null, ""] } }],
      })
    ).length;
    const formationsAvecRncpEtSansCodeEducNat = await (
      await Formation.find({
        $and: [{ rncp_code: { $nin: [null, ""] } }, { educ_nat_code: { $in: [null, ""] } }],
      })
    ).length;

    const formationsSansRncpEtAvecCodeEducNat = await (
      await Formation.find({
        $and: [{ rncp_code: { $in: [null, ""] } }, { educ_nat_code: { $nin: [null, ""] } }],
      })
    ).length;
    const formationsSansRncpEtSansCodeEducNat = await (
      await Formation.find({
        $and: [{ rncp_code: { $in: [null, ""] } }, { educ_nat_code: { $in: [null, ""] } }],
      })
    ).length;

    const stats = {
      nbFormationsTotal,
      nbFormationsAvecRncp: formationsAvecRncp.length,
      // formationsSansRncp,
      // formationsAvecCodeEducNat,
      // formationsSansCodeEducNat,
      // formationsAvecRncpEtCodeEducNat,
      // formationsAvecRncpEtSansCodeEducNat,
      // formationsSansRncpEtAvecCodeEducNat,
      // formationsSansRncpEtSansCodeEducNat,
    };

    console.log(stats);
  } catch (err) {
    console.error(err);
  }
};

run();
