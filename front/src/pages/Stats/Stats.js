import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { API } from "aws-amplify";

import contants from "./constants";

import "./stats.css";

const scroll = async (index, scroll_id) => {
  let result = [];
  let resultLength = -1;
  do {
    const resp = await API.post("api", `/es/search/${index}/scroll?scroll_id=${scroll_id}`);
    result = [...result, ...resp.hits.hits];
    resultLength = resp.hits.hits.length;
  } while (resultLength !== 0);

  return result;
};

const getEntities = async index => {
  const resp = await API.post("api", `/es/search/${index}/scroll`, {
    body: {
      query: {
        match_all: {},
      },
      size: 100,
    },
  });
  let result = resp.hits.hits;

  if (resp._scroll_id) {
    result = [...result, ...(await scroll(index, resp._scroll_id))];
  }
  return result;
};

const StatsDS = ({ formations }) => {
  const dossiersDsUnique = [...new Set(formations.map(item => item._source.ds_id_dossier))];
  const formationsDSUnique = formations.filter(item => item._source.source === "DS");
  return (
    <div>
      <h3>Statistiques Démarches Simplifiées</h3>
      <ul>
        <li>Nombre de dossiers différents : {dossiersDsUnique.length}</li>
        <li>Nombre de formations DS dans le catalogue : {formationsDSUnique.length}</li>
      </ul>
    </div>
  );
};

const StatsRCO = ({ formations }) => {
  const formationsRCOUnique = formations.filter(item => item._source.source === "RCO");
  return (
    <div>
      <h3>Statistiques RCO</h3>
      <ul>
        <li>Nombre de formations RCO dans le catalogue : {formationsRCOUnique.length}</li>
      </ul>
    </div>
  );
};

const StatsOther = ({ formations }) => {
  const formationsAutresUnique = formations.filter(
    item => item._source.source !== "RCO" && item._source.source !== "DS"
  );
  return (
    <div>
      <h3>Statistiques Formations Autres</h3>
      <ul>
        <li>Nombre de formations Autres (non Ds / non RCO) dans le catalogue : {formationsAutresUnique.length}</li>
      </ul>
    </div>
  );
};

const StatsDepp = ({ etablissements }) => {
  const etablissementInDepp = etablissements.filter(
    item => item._source.info_depp === contants.infosCodes.infoDEPP.Found
  );
  const etablissementNotInDepp = etablissements.filter(
    item => item._source.info_depp === contants.infosCodes.infoDEPP.NotFound
  );
  const etablissementMissingUai = etablissements.filter(
    item => item._source.info_depp === contants.infosCodes.infoDEPP.MissingUai
  );
  return (
    <div>
      <h3>Statistiques DEPP</h3>
      <ul>
        <li>Nombre d'etablissements trouvés dans fichier DEPP : {etablissementInDepp.length}</li>
        <li>Nombre d'etablissements non trouvés fichier DEPP : {etablissementNotInDepp.length}</li>
        <li>
          {" "}
          Nombre d'etablissements avec UAI manquants - non cherchés dans fichier DEPP : {etablissementMissingUai.length}
        </li>
      </ul>
    </div>
  );
};

const StatsGlobal = ({ formations, etablissements }) => {
  const etablissementsCfa = etablissements.filter(
    item => item._source.computed_type === contants.computeCodes.IsCfaOrOfa.CFA
  );
  const etablissementsOf = etablissements.filter(
    item => item._source.computed_type === contants.computeCodes.IsCfaOrOfa.OF
  );
  const etablissementsToCheck = etablissements.filter(
    item => item._source.computed_type === contants.computeCodes.IsCfaOrOfa.ToCheck
  );
  const etablissementsPrefectureDeclared = etablissements.filter(
    item => item._source.computed_declare_prefecture === contants.computeCodes.OrganismeDeclarePrefecture.Yes
  );
  const etablissementsNotPrefectureDeclared = etablissements.filter(
    item => item._source.computed_declare_prefecture === contants.computeCodes.OrganismeDeclarePrefecture.No
  );
  const etablissementsConventionnes = etablissements.filter(
    item => item._source.computed_conventionne === contants.computeCodes.OrganismeConventionne.Yes
  );
  const etablissementsNotConventionnes = etablissements.filter(
    item => item._source.computed_conventionne === contants.computeCodes.OrganismeConventionne.No
  );
  const formationsLevel3Or4 = formations.filter(
    item => item._source.niveau === "3 (CAP...)" || item._source.niveau === "4 (Bac...)"
  );
  const formationsLevel5Or6 = formations.filter(
    item => item._source.niveau === "5 (BTS, DUT...)" || item._source.niveau === "6 (Licence...)"
  );
  return (
    <div>
      <h3>Statistiques Catalogue MNA [Etablissements]</h3>
      <ul>
        <li>Nombre d'etablissements au total : {etablissements.length}</li>
        <li>Nombre d'etablissements CFA : {etablissementsCfa.length}</li>
        <li>Nombre d'etablissements OF : {etablissementsOf.length}</li>
        <li>Nombre d'etablissements CFA/OF A Vérifier : {etablissementsToCheck.length}</li>
        <li>Nombre d'etablissements déclarés en préfecture : {etablissementsPrefectureDeclared.length}</li>
        <li>Nombre d'etablissements non déclarés en préfécture : {etablissementsNotPrefectureDeclared.length}</li>
        <li>Nombre d'etablissements conventionnés : {etablissementsConventionnes.length}</li>
        <li>Nombre d'etablissements non conventionnés : {etablissementsNotConventionnes.length}</li>
      </ul>
      <h3>Statistiques Catalogue MNA [Formations]</h3>
      <ul>
        <li>Nombre de formations total catalogue : {formations.length}</li>
        <li>Nombre de formations de niveau 3 et 4 : {formationsLevel3Or4.length}</li>
        <li>Nombre de formations de niveau 4 et 5 : {formationsLevel5Or6.length}</li>
      </ul>
    </div>
  );
};

export default () => {
  const [loading, setLoading] = useState(true);
  const [etablissements, setEtablissements] = useState([]);
  const [formations, setFormations] = useState([]);
  useEffect(() => {
    async function run() {
      try {
        const retablissements = await getEntities("etablissements");
        setEtablissements(retablissements);
        const rformations = await getEntities("formations");
        setFormations(rformations);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, []);
  return (
    <div className="page stats">
      <Container className="mt-5 mb-5">
        <Row>
          <Col xs="8" className="mission-summary">
            <h2>Statistiques mission apprentissage</h2>
            <br />
          </Col>
          <Col xs="12" className="mission-summary">
            {loading && <div>Chargement en cours (peut prendre plus d'une minute)...</div>}
            {!loading && (
              <>
                <StatsDS formations={formations} />
                <StatsRCO formations={formations} />
                <StatsOther formations={formations} />
                <StatsDepp etablissements={etablissements} />
                <StatsGlobal formations={formations} etablissements={etablissements} />
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};
