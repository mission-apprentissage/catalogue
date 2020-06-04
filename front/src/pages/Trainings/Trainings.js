import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, ToggleButton, DataSearch } from "@appbaseio/reactivesearch";
import { Container, Row, Col } from "reactstrap";
import Switch from "react-switch";
import { API } from "aws-amplify";

import SearchResult, { columnsDefinition } from "./components/SearchResult";
import ExportButton from "../../components/ExportButton";
import config, { getEnvName } from "../../config";

import QueryBuilder from "../../components/QueryBuilder";
import Facet from "../../components/Facet";
import CardList from "../../components/CardList";

import "./trainings.css";

const STAGE = getEnvName();

const FILTERS = [
  "QUERYBUILDER",
  "SEARCH",
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
  "nom_academie",
  "num_academie_siege",
  "uai_formation",
  "codePostal",
  "codeCommuneInsee",
  "ds_id_dossier",
  "catalogue_published",
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
  "parcoursup_a_charger",
  "diplome",
];

export default () => {
  const [publishedTrainings, setPublishedTrainings] = useState("true");
  const [countFormations, setCountFormations] = useState(0);
  const [debug, setDebug] = useState(false);
  const [mode, setMode] = useState("simple");
  useEffect(() => {
    async function run() {
      try {
        const resp = await API.get("api", `/formations/count`, {
          queryStringParameters: {
            published: true,
          },
        });
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

  const handleSearchSwitchChange = () => {
    setMode(mode === "simple" ? "advanced" : "simple");
  };

  return (
    <div className="page trainings">
      <h1 className="mt-3">Liste des formations en apprentissage</h1>
      <ReactiveBase url={`${config.aws.apiGateway.endpoint}/es/search`} app="formations">
        <div className="search">
          <Container fluid style={{ maxWidth: 1860 }}>
            {STAGE !== "prod" && (
              <label className="react-switch" style={{ right: "285px" }}>
                <Switch onChange={handleSwitchChange} checked={debug} />
                <span>Vue recette</span>
              </label>
            )}
            <label className="react-switch" style={{ right: "70px" }}>
              <Switch onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
              <span>Recherche avancée</span>
            </label>
            <h1 className="title">Votre recherche</h1>
            <Row className="search-row">
              <div className={`search-sidebar`}>
                <Facet
                  componentId="etablissement_responsable_siret"
                  dataField="etablissement_responsable_siret.keyword"
                  title="Siret responsable"
                  filterLabel="etablissement_responsable_siret"
                  selectAllLabel="Tous les sirets"
                  filters={FILTERS}
                  sortBy="count"
                />
                <Facet
                  componentId="niveau"
                  dataField="niveau.keyword"
                  title="Niveau de formation"
                  filterLabel="niveau"
                  selectAllLabel="Tous les niveaux"
                  filters={FILTERS}
                  sortBy="count"
                />
                <Facet
                  componentId="nom_academie"
                  dataField="nom_academie.keyword"
                  title="Nom Académie"
                  filterLabel="nom_academie"
                  selectAllLabel="Toutes les académies"
                  filters={FILTERS}
                  sortBy="asc"
                />
                <ToggleButton
                  componentId="catalogue_published"
                  className="published-btn"
                  dataField="etablissement_reference_catalogue_published"
                  data={[
                    { label: "Catalogue général", value: "true" },
                    { label: "Catalogue non-éligible", value: "false" },
                  ]}
                  //defaultValue={"true"}
                  //value={publishedTrainings}
                  multiSelect={false}
                  showFilter={true}
                  URLParams={false}
                  // onChange={e => {
                  //   if (e.value && e.value !== publishedTrainings) {
                  //     setPublishedTrainings(publishedTrainings === "true" ? "false" : "true");
                  //   }
                  // }}
                />
              </div>
              <div className="search-results">
                {mode !== "simple" && (
                  <QueryBuilder
                    collection="formations"
                    fields={[
                      { text: "Siret formateur", value: "etablissement_formateur_siret.keyword" },
                      { text: "Siret responsable", value: "etablissement_responsable_siret.keyword" },
                      { text: "Numéro d'académie", value: "num_academie" },
                      { text: "Niveau", value: "niveau.keyword" },
                      { text: "Type d'établissement", value: "etablissement_reference_type.keyword" },
                      { text: "Conventionné", value: "etablissement_reference_conventionne.keyword" },
                      { text: "Déclaré en prefecture", value: "etablissement_reference_declare_prefecture.keyword" },
                      { text: "Référencé datadock", value: "etablissement_reference_datadock.keyword" },
                      { text: "Code diplôme (Éducation nationale)", value: "educ_nat_code.keyword" },
                      { text: "Numéero de département", value: "num_departement" },
                      { text: "Nom de l'académie", value: "nom_academie.keyword" },
                      { text: "Uai du lieu de formation", value: "uai_formation.keyword" },
                      { text: "Diplôme", value: "diplome.keyword" },
                      { text: "Mef 10", value: "mef_10_code.keyword" },
                    ]}
                  />
                )}
                {mode === "simple" && (
                  <div className={`search-container search-container-${mode}`}>
                    <DataSearch
                      componentId="SEARCH"
                      placeholder="Saisissez un diplome, un UAI ou un numéro de Siret"
                      dataField={["etablissement_formateur_siret", "diplome", "uai_formation"]}
                      autosuggest={true}
                      queryFormat="or"
                      size={20}
                      showFilter={true}
                    />
                  </div>
                )}
                <div className={`result-view`}>
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
                    renderItem={data => <CardList data={data} key={data._id} />}
                    renderResultStats={stats => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {`${stats.numberOfResults} formations affichées sur ${
                              countFormations !== 0 ? countFormations : ""
                            } formations au total`}
                          </span>
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
                        </div>
                      );
                    }}
                    react={{ and: FILTERS }}
                  />
                </div>
              </div>
            </Row>
          </Container>
        </div>

        {/* <ReactiveList
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
        />*/}
      </ReactiveBase>
    </div>
  );
};
