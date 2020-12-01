import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { API } from "aws-amplify";
import { push } from "connected-react-router";

import Changelog from "../../components/Changelog";

import { _get } from "../../services/httpClient";

import content from "../../CHANGELOG";
import routes from "../../routes.json";
import "./landing.css";

import { getEnvName } from "../../config";

const getCount = async (index, filter = {}) => {
  const params = new window.URLSearchParams({
    query: JSON.stringify(filter),
  });
  const resp = await API.get("api", `/${index}/count?${params}`);

  return resp.count;
};
const ENV_NAME = getEnvName();
const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://catalogue-recette.apprentissage.beta.gouv.fr/api"
    : "https://catalogue.apprentissage.beta.gouv.fr/api";

export default () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [countEstablishments, setCountEstablishments] = useState(0);
  const [countFormations, setCountFormations] = useState(0);
  useEffect(() => {
    async function run() {
      try {
        setCountEstablishments(await getCount("etablissements", { published: true }));

        const params = new window.URLSearchParams({
          query: JSON.stringify({ published: true }),
        });
        const countFormations = await _get(`${endpointNewFront}/entity/formations/count?${params}`);
        setCountFormations(countFormations);

        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, []);
  return (
    <div className="page landing">
      <Container className="mt-5">
        <Row>
          <Col xs="8" className="mission-summary">
            <h4>Catalogue des offres de formations en apprentissage en France.</h4>
            <br />
          </Col>
          <Col xs="12" className="mission-summary">
            Le catalogue des offres de formation en apprentissage recense aujourd’hui près de
            <br /> &nbsp;
            {loading && <div>chargement...</div>}
            {!loading && (
              <strong>
                {countFormations} formations et plus de {countEstablishments} établissements !
              </strong>
            )}
            <br />
            <br />
            Vos retours utilisateurs sont les bienvenus afin d’améliorer l’usage de ce catalogue, vous pouvez ainsi
            réaliser des modifications directement sur la base si vous repérez une coquille. Nous avons basculé vers une
            version accessible en ligne qui vous permet de modifier directement certains champs, d’avoir au fil de l’eau
            la visibilité sur les améliorations apportées au catalogue et éviter les échanges de fichiers plats.
            <br />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs="12" sm="6" md="4" className="mt-2">
            <Button color="primary" onClick={() => dispatch(push(routes.SEARCH_FORMATIONS))}>
              Consulter la liste des formations
            </Button>
          </Col>
          <Col xs="12" sm="6" md="4" className="mt-2">
            <Button color="primary" onClick={() => dispatch(push(routes.SEARCH_ETABLISSEMENTS))}>
              Consulter la liste des établissements
            </Button>
          </Col>
        </Row>
        <Row className="mt-5 mb-3">
          <Col xs="8" className="mission-summary">
            <h4>Dernières modifications</h4>
          </Col>
        </Row>
        <Row>
          <Col xs="12" className="mission-summary">
            <Changelog content={content} order="desc" showVersion="last2" hideFilter={true} />
          </Col>
        </Row>
        <Row className="mt-1 mb-4">
          <Col xs={{ size: 3, offset: 9 }} className="mission-summary">
            <Button color="primary" onClick={() => dispatch(push(routes.CHANGELOG))}>
              Voir les précédentes versions
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
