import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { API } from "aws-amplify";
import { push } from "connected-react-router";

import Changelog from "../../components/Changelog";

import content from "../../CHANGELOG";
import routes from "../../routes.json";
import "./landing.css";

const getCount = async (index, filter = {}) => {
  const params = new window.URLSearchParams({
    query: JSON.stringify(filter),
  });
  const resp = await API.get("api", `/${index}/count?${params}`);

  return resp.count;
};

export default () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [countEstablishments, setCountEstablishments] = useState(0);
  const [countFormations, setCountFormations] = useState(0);
  useEffect(() => {
    async function run() {
      try {
        setCountEstablishments(await getCount("etablissements", { published: true }));
        setCountFormations(await getCount("formations", { published: true }));
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
            <h4>
              La mission apprentissage a pour vocation de collecter ainsi que rendre visible les offres de formations en
              apprentissage en France.
            </h4>
            <br />
          </Col>
          <Col xs="12" className="mission-summary">
            Vous avez collaboré avec nous à la constitution du catalogue des offres de formation en apprentissage qui
            recense aujourd’hui près de
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
              Voir les précedentes versions
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
