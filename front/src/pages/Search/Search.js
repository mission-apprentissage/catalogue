import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, DataSearch } from "@appbaseio/reactivesearch";
import { Container, Row, Button } from "reactstrap";
import { Link } from "react-router-dom";
import Switch from "react-switch";
import { API } from "aws-amplify";
import { useSelector } from "react-redux";

import config from "../../config";

import routes from "../../routes.json";

import {
  QueryBuilder,
  CardListFormation,
  CardListEtablissements,
  Facet,
  Pagination,
  ToggleCatalogue,
  ExportButton,
} from "./components";

import constantsFormations from "./constantsFormations";
import constantsEtablissements from "./constantsEtablissements";

import { _get } from "../../services/httpClient";

import "./search.css";

const endpointNewFront = "https://catalogue.apprentissage.beta.gouv.fr/api";

export default ({ match }) => {
  const [countItems, setCountItems] = useState(0);
  const [mode, setMode] = useState("simple");
  const [base, setBase] = useState("mnaformation");
  const [endPoint, setEndpoint] = useState(endpointNewFront);

  const { FILTERS, columnsDefinition, facetDefinition, queryBuilderField, dataSearch } =
    base === "mnaformation" ? constantsFormations : constantsEtablissements;

  const { user } = useSelector(state => state.user);

  useEffect(() => {
    async function run() {
      try {
        const tmpBase = match.params.base === "formations" ? "mnaformation" : "etablissements";

        setEndpoint(tmpBase === "mnaformation" ? endpointNewFront : config.aws.apiGateway.endpoint);
        setBase(tmpBase);

        let countFormations = 0;
        if (tmpBase === "mnaformation") {
          const params = new window.URLSearchParams({
            query: JSON.stringify({ published: true }),
          });
          countFormations = await _get(`${endpointNewFront}/entity/formations/count?${params}`);
        } else {
          const resp = await API.get("api", `/${tmpBase}/count`, {
            queryStringParameters: {
              query: JSON.stringify({ published: true }),
            },
          });
          countFormations = resp.count;
        }

        setCountItems(countFormations);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [match]);

  const handleSearchSwitchChange = () => {
    setMode(mode === "simple" ? "advanced" : "simple");
  };

  return (
    <div className="page search-page">
      <h1 className="mt-3">Catalogue de l'apprentissage</h1>
      <ReactiveBase url={`${endPoint}/es/search`} app={base}>
        <div className="search">
          <Container fluid style={{ maxWidth: 1860 }}>
            <label className="react-switch" style={{ right: "70px" }}>
              <Switch onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
              <span>Recherche avancée</span>
            </label>
            <h1 className="title">Votre recherche {base === "mnaformation" ? "de formations" : "d'établissements"}</h1>
            <Row className="search-row">
              <div className={`search-sidebar`}>
                {facetDefinition.map((fd, i) => {
                  return (
                    <Facet
                      key={i}
                      componentId={fd.componentId}
                      dataField={fd.dataField}
                      title={fd.title}
                      filterLabel={fd.filterLabel}
                      selectAllLabel={fd.selectAllLabel}
                      filters={FILTERS}
                      sortBy={fd.sortBy}
                    />
                  );
                })}
                {base === "mnaformation" && <ToggleCatalogue filters={FILTERS} />}
                <a href={`/${base}`}>Aller à l'ancienne interface</a>
                {base === "mnaformation" && user && (
                  <div className="mt-3 add-btn">
                    <Button color="primary" outline>
                      <Link to={routes.ADD_FORMATION} className={"nav-link link"}>
                        Ajouter une formation
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="search-results">
                {mode !== "simple" && (
                  <QueryBuilder
                    lang="fr"
                    collection={base}
                    react={{ and: FILTERS.filter(e => e !== "QUERYBUILDER") }}
                    fields={queryBuilderField}
                  />
                )}
                {mode === "simple" && (
                  <div className={`search-container search-container-${mode}`}>
                    <DataSearch
                      componentId="SEARCH"
                      placeholder={dataSearch.placeholder}
                      fieldWeights={dataSearch.fieldWeights}
                      dataField={dataSearch.dataField}
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
                    dataField={base === "mnaformation" ? "_id" : "_id"}
                    loader="Chargement des résultats.."
                    size={8}
                    pagination={true}
                    showEndPage={true}
                    renderPagination={paginationProp => {
                      return <Pagination {...paginationProp} />;
                    }}
                    showResultStats={true}
                    sortBy="asc"
                    defaultQuery={() => {
                      return {
                        //_source: exportTrainingColumns.map(def => def.accessor),
                        query: {
                          match: {
                            published: true,
                          },
                        },
                      };
                    }}
                    renderItem={data =>
                      base === "mnaformation" ? (
                        <CardListFormation data={data} key={data._id} />
                      ) : (
                        <CardListEtablissements data={data} key={data._id} />
                      )
                    }
                    renderResultStats={stats => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {base === "mnaformation"
                              ? `${stats.numberOfResults} formations affichées sur ${
                                  countItems !== 0 ? countItems : ""
                                } formations au total`
                              : `${stats.numberOfResults} établissements affichées sur ${
                                  countItems !== 0 ? countItems : ""
                                } établissements`}
                          </span>
                          <ExportButton
                            index={base}
                            filters={FILTERS}
                            columns={columnsDefinition
                              .filter(def => !def.debug || (user && def.exportOnly && def.debug))
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
