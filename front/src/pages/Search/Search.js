import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, DataSearch } from "@appbaseio/reactivesearch";
import { Container, Row } from "reactstrap";
// import { Container, Row, Button } from "reactstrap";
// import { Link } from "react-router-dom";
import Switch from "react-switch";
import { API } from "aws-amplify";
import { useSelector } from "react-redux";

import config from "../../config";

//import routes from "../../routes.json";

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
import constantsRcoFormations from "./constantsRCOFormations";
import constantsEtablissements from "./constantsEtablissements";

import { _get } from "../../services/httpClient";

import "./search.css";

import { getEnvName } from "../../config";
const ENV_NAME = getEnvName();
const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://catalogue-recette.apprentissage.beta.gouv.fr/api"
    : "https://catalogue.apprentissage.beta.gouv.fr/api";

export default ({ match }) => {
  const [countItems, setCountItems] = useState(0);
  const [mode, setMode] = useState("simple");
  const [base, setBase] = useState("mnaformation");
  const [endPoint, setEndpoint] = useState(endpointNewFront);

  const { FILTERS, columnsDefinition, facetDefinition, queryBuilderField, dataSearch } =
    base === "mnaformation"
      ? constantsFormations
      : base === "convertedformation"
      ? constantsRcoFormations
      : constantsEtablissements;

  const { user } = useSelector(state => state.user);

  useEffect(() => {
    async function run() {
      try {
        let tmpBase = "mnaformation";
        switch (match.params.base) {
          case "formations":
            tmpBase = "mnaformation";
            break;
          case "etablissements":
            tmpBase = "etablissements";
            break;
          case "formations2021":
            tmpBase = "convertedformation";
            break;
          default:
            tmpBase = "mnaformation";
            break;
        }

        setEndpoint(
          tmpBase === "mnaformation" || tmpBase === "convertedformation"
            ? endpointNewFront
            : config.aws.apiGateway.endpoint
        );
        setBase(tmpBase);

        let countFormations = 0;
        if (tmpBase === "mnaformation") {
          const params = new window.URLSearchParams({
            query: JSON.stringify({ published: true }),
          });
          countFormations = await _get(`${endpointNewFront}/entity/formations/count?${params}`);
        } else if (tmpBase === "convertedformation") {
          const params = new window.URLSearchParams({
            query: JSON.stringify({ published: true }),
          });
          countFormations = await _get(`${endpointNewFront}/entity/formations2021/count?${params}`);
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
      <h1 className="mt-3">
        Catalogue de l'apprentissage
        {base === "convertedformation" ? " 2021" : ""}
      </h1>
      <ReactiveBase url={`${endPoint}/es/search`} app={base}>
        <div className="search">
          <Container fluid style={{ maxWidth: 1860 }}>
            <label className="react-switch" style={{ right: "70px" }}>
              <Switch onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
              <span>Recherche avancée</span>
            </label>
            <h1 className="title">
              Votre recherche{" "}
              {base === "mnaformation"
                ? "de formations"
                : base === "convertedformation"
                ? "de formations 2021"
                : "d'établissements"}
            </h1>
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
                {(base === "mnaformation" || base === "convertedformation") && <ToggleCatalogue filters={FILTERS} />}
                {/* <a href={`/${base}`}>Aller à l'ancienne interface</a> */}
                {base === "mnaformation" && user && (
                  <div className="mt-3 add-btn">
                    {/* <Button color="primary" outline>
                      <Link to={routes.ADD_FORMATION} className={"nav-link link"}>
                        Ajouter une formation
                      </Link>
                    </Button> */}
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
                    dataField="_id"
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
                      base === "mnaformation" || base === "convertedformation" ? (
                        <CardListFormation data={data} key={data._id} f2021={base === "convertedformation"} />
                      ) : (
                        <CardListEtablissements data={data} key={data._id} />
                      )
                    }
                    renderResultStats={stats => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {base === "mnaformation" || base === "convertedformation"
                              ? `${stats.numberOfResults} formations affichées sur ${
                                  countItems !== 0 ? countItems : ""
                                } formations au total`
                              : `${stats.numberOfResults} établissements affichées sur ${
                                  countItems !== 0 ? countItems : ""
                                } établissements`}
                          </span>
                          {(base !== "convertedformation" || (user && base === "convertedformation")) && (
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
                          )}
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
