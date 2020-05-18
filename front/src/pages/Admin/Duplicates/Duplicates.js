import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import { API } from "aws-amplify";

import DuplicateHandler from "./components/DuplicateHandler";

import duplicatesPages from "./duplicates.json";

import "./duplicates.css";

export default () => {
  const { router } = useSelector(state => state);
  const { query } = router.location;
  const [duplicates, setDuplicates] = useState([]);

  useEffect(() => {
    async function run() {
      try {
        const duplicateTmp = [];
        for (let i = 0; i < duplicatesPages[query.page].length; i++) {
          const id = duplicatesPages[query.page][i];
          const resp = await API.get("api", `/formation/${id}`);
          duplicateTmp.push(resp);
        }
        setDuplicates(duplicateTmp);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [query]);

  return (
    <div className="page duplicates">
      <h1 className="mt-3">Liste des doublons</h1>
      <Container>
        <Row>
          <Col xs="12">
            <DuplicateHandler duplicates={duplicates} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};
