import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, ToggleButton } from "@appbaseio/reactivesearch";
import { Container, Row, Col } from "reactstrap";
import Switch from "react-switch";
import { API } from "aws-amplify";

import SearchResult, { columnsDefinition } from "./components/SearchResult";
import ExportButton from "../../components/ExportButton";
import config, { getEnvName } from "../../config";

import "./trainings.css";

const STAGE = getEnvName();

const FILTERS = [
  "etablissement_formateur_siret",
  "etablissement_responsable_siret",
  "num_academie",
  "niveau",
  "siren",
  "etablissement_reference_type",
  "etablissement_reference_conventionne",
  "etablissement_reference_declare_prefecture",
  "etablissement_reference_datadock",
  "source",
  "educ_nat_code",
  "num_departement",
  "nomAcademie",
  "num_academie_siege",
  "uai_formation",
  "codePostal",
  "codeCommuneInsee",
  "ds_id_dossier",
  "published",
  "etablissement_responsable_uai",
  "etablissement_formateur_uai",
  "intitule_long",
  "intitule_court",
  "rncp_eligible_apprentissage",
  "rncp_etablissement_reference_habilite",
  "rome_codes",
  "rncp_code",
  "mef_10_code",
  "mef_8_code",
  "mef_8_codes",
  "parcoursup_reference",
];

export default () => {
  const [publishedTrainings, setPublishedTrainings] = useState("true");
  const [countFormations, setCountFormations] = useState(0);
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    async function run() {
      try {
        const resp = await API.get("api", `/formations/count`);
        setCountFormations(resp.count);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, []);

  const handleSwitchChange = () => {
    setDebug(!debug);
  };

  return (
    <div className="page trainings">
      <h1 className="mt-3">Liste des formations en apprentissage</h1>
      <Container>
        {STAGE !== "prod" && (
          <Row>
            <Col xs="12">
              <Switch onChange={handleSwitchChange} checked={debug} />
              <span className="debug-text-button">Vue recette (afficher MEF, Psup, RNCP ... )</span>
            </Col>
          </Row>
        )}
        <Row>
          <Col xs="12">
            <ReactiveBase url={`${config.aws.apiGateway.endpoint}/es/search`} app="formations">
              <ExportButton
                index={"formations"}
                filters={FILTERS}
                columns={columnsDefinition
                  .filter(def => !def.debug || debug)
                  .map(def => ({ header: def.Header, fieldName: def.accessor }))}
              />
              <ReactiveList
                componentId="result"
                title="Results"
                dataField="source.keyword"
                loader="Chargement des résultats.."
                size={8}
                pagination={true}
                showResultStats={true}
                sortBy="asc"
                render={({ data, loading }) => {
                  return <SearchResult data={data} filters={FILTERS} loading={loading} debug={debug} />;
                }}
                renderResultStats={stats => {
                  return (
                    <p style={{ fontSize: 14 }}>{`${stats.numberOfResults} formations affichées sur ${
                      countFormations !== 0 ? countFormations : ""
                    } formations au total`}</p>
                  );
                }}
                react={{ and: FILTERS }}
              />
              <ToggleButton
                componentId="published"
                className="published-btn"
                dataField="etablissement_reference_published"
                data={[
                  { label: "Catalogue général", value: "true" },
                  { label: "Catalogue non-éligible", value: "false" },
                ]}
                defaultValue={"true"}
                value={publishedTrainings}
                multiSelect={false}
                showFilter={true}
                URLParams={false}
                onChange={e => {
                  if (e.value && e.value !== publishedTrainings) {
                    setPublishedTrainings(publishedTrainings === "true" ? "false" : "true");
                  }
                }}
              />
            </ReactiveBase>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
