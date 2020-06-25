import React, { useState } from "react";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import { Container, Row, Col } from "reactstrap";
import Switch from "react-switch";

import ExportButton from "../../../components/ExportButton";
import SearchResult, { columnsDefinition } from "./components/SearchResult";

import config, { getEnvName } from "../../../config";

import "./establishments.css";

const STAGE = getEnvName();

const FILTERS = [
  "SIRET",
  "UAI",
  "SIREN",
  "CP",
  "CC",
  "type",
  "conventionne",
  "declarePrefecture",
  "infoDataDock",
  "numAcademie",
  "nom_academie",
  "parcoursup_a_charger",
  "affelnet_a_charger",
  "formations_n3",
  "formations_n4",
  "formations_n5",
  "formations_n6",
  "formations_n7",
  "naf_code",
];

export default () => {
  const [debug, setDebug] = useState(false);

  const handleSwitchChange = () => {
    setDebug(!debug);
  };

  return (
    <div className="page establishments">
      <h1 className="mt-3">Liste des établissements</h1>
      <Container>
        {STAGE !== "prod" && (
          <Row>
            <Col xs="12">
              <Switch onChange={handleSwitchChange} checked={debug} />
              <span className="debug-text-button">Vue recette</span>
            </Col>
          </Row>
        )}
        <Row>
          <Col xs="12">
            <ReactiveBase url={`${config.aws.apiGateway.endpoint}/es/search`} app="etablissements">
              <ExportButton
                index={"etablissements"}
                filters={FILTERS}
                columns={columnsDefinition.map(def => ({ header: def.Header, fieldName: def.accessor }))}
                defaultQuery={{
                  match: {
                    published: true,
                  },
                }}
              />
              <ReactiveList
                componentId="result"
                title="Results"
                dataField="idEtablissement"
                loader="Chargement des résultats.."
                size={8}
                pagination={true}
                showResultStats={true}
                defaultQuery={() => {
                  return {
                    _source: columnsDefinition.map(def => def.accessor),
                    query: {
                      match: {
                        published: true,
                      },
                    },
                  };
                }}
                render={({ data, loading }) => {
                  return <SearchResult data={data} filters={FILTERS} loading={loading} debug={debug} />;
                }}
                renderResultStats={stats => {
                  return <p style={{ fontSize: 14 }}>{`${stats.numberOfResults} établissements trouvés`}</p>;
                }}
                react={{ and: FILTERS }}
              />
            </ReactiveBase>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
