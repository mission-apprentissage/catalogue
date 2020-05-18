import React from "react";
import { useSelector } from "react-redux";
import { Container, Row, Col } from "reactstrap";

import DuplicateHandler from "./components/DuplicateHandler";

import duplicates from "./duplicates.json";

import "./duplicates.css";

export default () => {
  const { router } = useSelector(state => state);
  const { query } = router.location;
  console.log(duplicates[query.page]);
  return (
    <div className="page duplicates">
      <h1 className="mt-3">Liste des doublons</h1>
      <Container>
        <Row>
          <Col xs="12">
            <DuplicateHandler duplicates={duplicates[query.page]} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};
