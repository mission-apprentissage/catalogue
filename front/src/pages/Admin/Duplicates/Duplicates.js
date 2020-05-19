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
  const [attrDiff, setAttrDiff] = useState([]);

  useEffect(() => {
    async function run() {
      try {
        const duplicateTmp = [];
        const attrDiffTmp = [];
        let firstF = null;
        for (let i = 0; i < duplicatesPages[query.page].length; i++) {
          const id = duplicatesPages[query.page][i];
          const resp = await API.get("api", `/formation/${id}`);
          duplicateTmp.push(resp);
          if (firstF) {
            for (const key in resp) {
              if (resp.hasOwnProperty(key)) {
                let val1 = firstF[key];
                let val2 = resp[key];
                if (Array.isArray(val1)) val1 = val1.join(",");
                if (Array.isArray(val2)) val2 = val2.join(",");

                if (val1 !== val2) {
                  if (attrDiffTmp.indexOf(key) === -1) attrDiffTmp.push(key);
                }
              }
            }
          } else {
            firstF = { ...resp };
          }
        }
        setAttrDiff(attrDiffTmp);
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
            <h6>Indications des champs différents {JSON.stringify(attrDiff)}</h6>
          </Col>
          <Col xs="12">{duplicates.length > 0 && <DuplicateHandler duplicates={duplicates} attrDiff={attrDiff} />}</Col>
        </Row>
      </Container>
    </div>
  );
};
