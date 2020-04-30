import React from "react";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import { Container, Row, Col } from "reactstrap";

import ExportButton from "../../components/ExportButton";
import SearchResult, { columnsDefinition } from "./components/SearchResult";

import { config } from "@config";

import "./establishments.css";

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
];

export default () => {
  return (
    <div className="page establishments">
      <h1 className="mt-3">Liste des établissements</h1>
      <Container>
        <Row>
          <Col xs="12">
            <ReactiveBase url={`${config.aws.apiGateway.endpoint}/es/search`} app="etablissements">
              <ExportButton
                index={"etablissements"}
                filters={FILTERS}
                columns={columnsDefinition.map((def) => ({ header: def.Header, fieldName: def.accessor }))}
              />
              <ReactiveList
                componentId="result"
                title="Results"
                dataField="idEtablissement"
                loader="Chargement des résultats.."
                size={8}
                pagination={true}
                showResultStats={true}
                render={({ data, loading }) => {
                  return <SearchResult data={data} filters={FILTERS} loading={loading} />;
                }}
                renderResultStats={(stats) => {
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
