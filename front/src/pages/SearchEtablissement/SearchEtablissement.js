import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, DataSearch } from "@appbaseio/reactivesearch";
import Pagination from "./Pagination";
import { Container, Row } from "reactstrap";
import Switch from "react-switch";
import { API } from "aws-amplify";

import ExportButton from "../../components/ExportButton";
import config from "../../config";

import QueryBuilder from "../../components/QueryBuilder";
import Facet from "../../components/Facet";
import CardList from "./components/CardList";

import "./searchEtablissement.css";

import exportEtablissementColumns from "./exportEtablissementColumns.json";

const FILTERS = ["QUERYBUILDER", "SEARCH", "num_departement", "nom_academie"];

export default ({ match }) => {
  const base = match.params.base || "etablissements";
  const [countEtablissements, setCountEtablissements] = useState(0);
  const [mode, setMode] = useState("simple");

  useEffect(() => {
    async function run() {
      try {
        const resp = await API.get("api", `/${base}/count`, {
          queryStringParameters: {
            query: JSON.stringify({ published: true }),
          },
        });
        setCountEtablissements(resp.count);
      } catch (e) {
        console.log(e);
      }
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSwitchChange = () => {
    setMode(mode === "simple" ? "advanced" : "simple");
  };

  return (
    <div className="page search-page">
      <h1 className="mt-3">Catalogue de l'apprentissage</h1>
      <ReactiveBase url={`${config.aws.apiGateway.endpoint}/es/search`} app={base}>
        <div className="search">
          <Container fluid style={{ maxWidth: 1860 }}>
            <label className="react-switch" style={{ right: "70px" }}>
              <Switch onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
              <span>Recherche avancée</span>
            </label>
            <h1 className="title">Votre recherche {base === "etablissements" ? "d'établissements" : ""}</h1>
            <Row className="search-row">
              <div className={`search-sidebar`}>
                <Facet
                  componentId="nom_academie"
                  dataField="nom_academie.keyword"
                  title="Académie"
                  filterLabel="nom_academie"
                  selectAllLabel="Toutes les académies"
                  filters={FILTERS}
                  sortBy="asc"
                />
                <Facet
                  componentId="num_departement"
                  dataField="num_departement.keyword"
                  title="Département"
                  filterLabel="num_departement"
                  selectAllLabel="Tous"
                  filters={FILTERS}
                  sortBy="asc"
                />
                <a href={`/etablissements`}>Aller à l'ancienne interface</a>
              </div>
              <div className="search-results">
                {mode !== "simple" && (
                  <QueryBuilder
                    lang="fr"
                    collection={base}
                    react={{ and: FILTERS.filter(e => e !== "QUERYBUILDER") }}
                    fields={[
                      { text: "Raison sociale", value: "entreprise_raison_sociale.keyword" },
                      { text: "Siret", value: "siret.keyword" },
                      { text: "Type d'établissement", value: "computed_type.keyword" },
                      { text: "Conventionné", value: "computed_conventionne.keyword" },
                      { text: "Déclaré en prefecture", value: "computed_declare_prefecture.keyword" },
                      { text: "Référencé datadock", value: "computed_info_datadock.keyword" },
                      { text: "Uai", value: "uai.keyword" },
                    ]}
                  />
                )}
                {mode === "simple" && (
                  <div className={`search-container search-container-${mode}`}>
                    <DataSearch
                      componentId="SEARCH"
                      placeholder="Saisissez une raison sociale, un UAI, ou un numéro de Siret"
                      fieldWeights={[3, 2, 1]}
                      dataField={["entreprise_raison_sociale", "uai", "siret"]}
                      autosuggest={true}
                      queryFormat="and"
                      size={20}
                      showFilter={true}
                    />
                  </div>
                )}
                <div className={`result-view`}>
                  <ReactiveList
                    componentId="result"
                    title="Results"
                    dataField="siret.keyword"
                    loader="Chargement des résultats.."
                    size={8}
                    pagination={true}
                    renderPagination={paginationProp => {
                      return <Pagination {...paginationProp} />;
                    }}
                    showResultStats={true}
                    sortBy="asc"
                    defaultQuery={() => {
                      return {
                        //_source: exportEtablissementColumns.map(def => def.accessor),
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
                            {`${stats.numberOfResults} établissements affichées sur ${
                              countEtablissements !== 0 ? countEtablissements : ""
                            } établissements`}
                          </span>
                          <ExportButton
                            index={base}
                            filters={FILTERS}
                            columns={exportEtablissementColumns
                              .filter(def => !def.debug)
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
      </ReactiveBase>
    </div>
  );
};
