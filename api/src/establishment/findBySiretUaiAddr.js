const {
  mongo: { connectToMongo, closeMongoConnection },
  model: { Establishment },
} = require("../common-api/getDependencies");
const { success, failure } = require("../common-api/response");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const query = qs && qs.query ? JSON.parse(qs.query) : {};
  const page = qs && qs.page ? qs.page : 1;
  const limit = qs && qs.limit ? parseInt(qs.limit, 3) : 3;

  try {
    await connectToMongo();
    let results = { docs: [] };
    if (query.adresse) {
      await Establishment.createIndexes();
      let search = await Establishment.find(
        {
          $text: {
            $search: query.adresse,
            $caseSensitive: false,
          },
        },
        {
          score: {
            $meta: "textScore",
          },
        }
      ).sort({ score: { $meta: "textScore" } });
      search = search.slice(0, limit);
      results.docs = search;
      results.pages = 1;
      results.page = 1;
      results.total = limit;
    } else {
      results = await Establishment.paginate(query, { page, limit });
    }

    closeMongoConnection();
    const etablissements = results.docs.map(eta => {
      // eslint-disable-next-line no-underscore-dangle
      const e = { ...eta._doc };
      delete e.formations_attachees;
      delete e.formations_ids;
      delete e.formations_n3;
      delete e.formations_n4;
      delete e.formations_n5;
      delete e.formations_n6;
      delete e.formations_n7;
      delete e.info_depp;
      delete e.info_dgefp;
      delete e.info_datagouv_ofs;
      delete e.info_datadock;

      delete e.api_entreprise_reference;
      delete e.parcoursup_a_charger;
      delete e.affelnet_a_charger;

      delete e.ds_id_dossier;
      delete e.ds_questions_siren;
      delete e.ds_questions_nom;
      delete e.ds_questions_email;
      delete e.ds_questions_uai;
      delete e.ds_questions_has_agrement_cfa;
      delete e.ds_questions_has_certificaton_2015;
      delete e.ds_questions_has_ask_for_certificaton;
      delete e.ds_questions_ask_for_certificaton_date;
      delete e.ds_questions_declaration_code;
      delete e.ds_questions_has_2020_training;
      delete e.catalogue_published;
      delete e.published;
      // eslint-disable-next-line no-underscore-dangle
      delete e._id;
      delete e.created_at;
      delete e.last_update_at;
      // eslint-disable-next-line no-underscore-dangle
      delete e.__v;
      delete e.etablissement_siege_id;

      console.log(e);
      return e;
    });

    callback(
      null,
      success({
        etablissements,
        pagination: {
          page: results.page,
          resultats_par_page: limit,
          nombre_de_page: results.pages,
          total: results.total,
        },
      })
    );
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
