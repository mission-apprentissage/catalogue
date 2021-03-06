import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, ToggleButton } from "@appbaseio/reactivesearch";
import { Container, Row, Col } from "reactstrap";
import Switch from "react-switch";
import { API } from "aws-amplify";

import SearchResult, { columnsDefinition } from "./components/SearchResult";
import ExportButton from "../../../components/ExportButton";
import { getEnvName } from "../../../config";

import "./trainings.css";

const STAGE = getEnvName();

const FILTERS = [
  "etablissement_formateur_siret",
  "etablissement_gestionnaire_siret",
  "num_academie",
  "niveau",
  "siren",
  "etablissement_reference_type",
  "etablissement_reference_conventionne",
  "etablissement_reference_declare_prefecture",
  "etablissement_reference_datadock",
  "source",
  "cfd",
  "num_departement",
  "nomAcademie",
  "etablissement_gestionnaire_num_academie",
  "uai_formation",
  "codePostal",
  "codeCommuneInsee",
  // "ds_id_dossier",
  "catalogue_published",
  "etablissement_gestionnaire_uai",
  "etablissement_formateur_uai",
  "intitule_long",
  "intitule_court",
  "rncp_eligible_apprentissage",
  "rncp_etablissement_gestionnaire_habilite",
  "rome_codes",
  "rncp_code",
  "mef_10_code",
  "mef_8_code",
  "mef_8_codes",
  "affelnet_reference",
  "parcoursup_reference",
  "parcoursup_a_charger",
  "affelnet_a_charger",
  "diplome",
];

// "https://catalogue-recette.apprentissage.beta.gouv.fr/api/es/search/mnaformation/_msearch";
const ENV_NAME = getEnvName();
const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://catalogue-recette.apprentissage.beta.gouv.fr/api"
    : "https://catalogue.apprentissage.beta.gouv.fr/api";
//<ReactiveBase url={`${config.aws.apiGateway.endpoint}/es/search`} app="formations">

export default () => {
  const [publishedTrainings, setPublishedTrainings] = useState("true");
  const [countFormations, setCountFormations] = useState(0);
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    async function run() {
      try {
        const params = new window.URLSearchParams({
          query: JSON.stringify({ published: true }),
        });
        const resp = await API.get("api", `/formations/count?${params}`);
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
              <span className="debug-text-button">Vue recette</span>
            </Col>
          </Row>
        )}
        <Row>
          <Col xs="12">
            <ReactiveBase url={`${endpointNewFront}/es/search`} app="mnaformation">
              <ExportButton
                index={"formations"}
                filters={FILTERS}
                columns={columnsDefinition
                  .filter(def => !def.debug || debug)
                  .map(def => ({ header: def.Header, fieldName: def.accessor }))}
                defaultQuery={{
                  match: {
                    published: true,
                  },
                }}
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
                  return (
                    <p style={{ fontSize: 14 }}>{`${stats.numberOfResults} formations affichées sur ${
                      countFormations !== 0 ? countFormations : ""
                    } formations au total`}</p>
                  );
                }}
                react={{ and: FILTERS }}
              />
              <ToggleButton
                componentId="catalogue_published"
                className="published-btn"
                dataField="etablissement_reference_catalogue_published"
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
