const { getDataFromCfd } = require("../cfdHandler");

const { connectToMongo, closeMongoConnection } = require("../../../../../../common/mongo");
const { Formation } = require("../../../../../../common/models");

const recoverRNCP = async () => {
  await connectToMongo();
  const formations = await Formation.find({
    rncp_code: null,
  });
  const formationsWithCodeCFD = formations.filter(f => f.educ_nat_code !== "" && f.educ_nat_code !== null);
  console.log(formationsWithCodeCFD.length);
  let count = 0;
  for (let i = 0; i < formationsWithCodeCFD.length; i++) {
    const formationWithCodeCFD = formationsWithCodeCFD[i];
    const cfdData = await getDataFromCfd(formationWithCodeCFD.educ_nat_code);
    const { rncp } = cfdData.result;
    if (rncp.code_rncp && rncp.code_rncp !== "") {
      count++;
      await Formation.findOneAndUpdate(
        { _id: formationWithCodeCFD._id },
        {
          ...formationWithCodeCFD,
          rncp_code: rncp.code_rncp,
        },
        { new: true }
      );
    }
  }
  console.log(count);
  closeMongoConnection();
};
module.exports.recoverRNCP = recoverRNCP;
