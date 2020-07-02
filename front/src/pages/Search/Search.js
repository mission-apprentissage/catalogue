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

import "./search.css";

export default ({ match }) => {
  const [countItems, setCountItems] = useState(0);
  const [mode, setMode] = useState("simple");
  const [base, setBase] = useState("formations");

  const { FILTERS, columnsDefinition, facetDefinition, queryBuilderField, dataSearch } =
    base === "formations" ? constantsFormations : constantsEtablissements;

  const { user } = useSelector(state => state.user);

  useEffect(() => {
    async function run() {
      try {
        const tmpBase =
          match.params.base === "formations" || match.params.base === "etablissements"
            ? match.params.base
            : "formations";
        setBase(tmpBase);
        const resp = await API.get("api", `/${tmpBase}/count`, {
          queryStringParameters: {
            query: JSON.stringify({ published: true }),
          },
        });
        setCountItems(resp.count);
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
      <ReactiveBase url={`${config.aws.apiGateway.endpoint}/es/search`} app={base}>
        <div className="search">
          <Container fluid style={{ maxWidth: 1860 }}>
            <label className="react-switch" style={{ right: "70px" }}>
              <Switch onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
              <span>Recherche avancée</span>
            </label>
            <h1 className="title">Votre recherche {base === "formations" ? "de formations" : "d'établissements"}</h1>
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
                {base === "formations" && <ToggleCatalogue filters={FILTERS} />}
                <a href={`/${base}`}>Aller à l'ancienne interface</a>
                {base === "formations" && user && (
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
                    dataField={base === "formations" ? "_id" : "_id"}
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
                      base === "formations" ? (
                        <CardListFormation data={data} key={data._id} />
                      ) : (
                        <CardListEtablissements data={data} key={data._id} />
                      )
                    }
                    renderResultStats={stats => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {base === "formations"
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
