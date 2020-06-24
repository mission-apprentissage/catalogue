import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, DataSearch, SingleList } from "@appbaseio/reactivesearch";
import Pagination from "./Pagination";
import { Container, Row, Button } from "reactstrap";
import { Link } from "react-router-dom";
import Switch from "react-switch";
import { API } from "aws-amplify";
import { useSelector } from "react-redux";

import ExportButton from "../../components/ExportButton";
import config from "../../config";

import routes from "../../routes.json";

import QueryBuilder from "../../components/QueryBuilder";
import Facet from "../../components/Facet";
import CardList from "../../components/CardList";

import "./search.css";

import exportTrainingColumns from "./exportTrainingColumns.json";

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

const ToggleCatalogue = React.memo(({ filters }) => {
  const [values, setValues] = useState("Catalogue général");

  const onChange = val => {
    setValues(val || "Catalogue général");
  };

  return (
    <SingleList
      componentId="catalogue_published"
      dataField="etablissement_reference_catalogue_published"
      react={{ and: filters.filter(e => e !== "catalogue_published") }}
      value={values}
      onChange={onChange}
      defaultValue="Catalogue général"
      transformData={data => {
        return data.map(d => ({
          ...d,
          key: d.key === 1 ? "Catalogue général" : "Catalogue non-éligible",
        }));
      }}
      customQuery={data => {
        return !data || data.length === 0
          ? {}
          : {
              query: {
                match: {
                  etablissement_reference_catalogue_published: data === "Catalogue général",
                },
              },
            };
      }}
      showFilter={true}
      showSearch={false}
      showCount={true}
    />
  );
});

export default ({ match }) => {
  const base = match.params.base || "formations";
  const [countFormations, setCountFormations] = useState(0);
  const [mode, setMode] = useState("simple");

  const { user } = useSelector(state => state.user);

  useEffect(() => {
    async function run() {
      try {
        const resp = await API.get("api", `/${base}/count`, {
          queryStringParameters: {
            query: JSON.stringify({ published: true }),
          },
        });
        setCountFormations(resp.count);
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
            <h1 className="title">Votre recherche {base === "formations" ? "de formations" : ""}</h1>
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
                <Facet
                  componentId="educ_nat_code"
                  dataField="educ_nat_code.keyword"
                  title="Code diplôme"
                  filterLabel="educ_nat_code"
                  selectAllLabel="Tous"
                  filters={FILTERS}
                  sortBy="asc"
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
                  componentId="rncp_code"
                  dataField="rncp_code.keyword"
                  title="Code RNCP"
                  filterLabel="rncp_code"
                  selectAllLabel="Tous"
                  filters={FILTERS}
                  sortBy="count"
                />
                <ToggleCatalogue filters={FILTERS} />
                <a href={`/formations`}>Aller à l'ancienne interface</a>
                {user && (
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
                    fields={[
                      { text: "Raison sociale", value: "entreprise_raison_sociale.keyword" },
                      { text: "Siret formateur", value: "etablissement_formateur_siret.keyword" },
                      { text: "Siret responsable", value: "etablissement_responsable_siret.keyword" },
                      { text: "Type d'établissement", value: "etablissement_reference_type.keyword" },
                      { text: "Conventionné", value: "etablissement_reference_conventionne.keyword" },
                      { text: "Déclaré en prefecture", value: "etablissement_reference_declare_prefecture.keyword" },
                      { text: "Référencé datadock", value: "etablissement_reference_datadock.keyword" },
                      { text: "Uai du lieu de formation", value: "uai_formation.keyword" },
                      { text: "Diplôme", value: "diplome.keyword" },
                      { text: "Mef 10", value: "mef_10_code.keyword" },
                      { text: "Affelnet à charger", value: "affelnet_a_charger" },
                    ]}
                  />
                )}
                {mode === "simple" && (
                  <div className={`search-container search-container-${mode}`}>
                    <DataSearch
                      componentId="SEARCH"
                      placeholder="Saisissez une raison sociale, un intitulé, un UAI, ou un numéro de Siret"
                      fieldWeights={[4, 3, 2, 2, 2, 1, 1]}
                      dataField={[
                        "entreprise_raison_sociale",
                        "intitule_long",
                        "uai_formation",
                        "etablissement_responsable_uai",
                        "etablissement_formateur_uai",
                        "etablissement_formateur_siret",
                        "etablissement_responsable_siret",
                      ]}
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
                    dataField="source.keyword"
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
                            index={base}
                            filters={FILTERS}
                            columns={exportTrainingColumns
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
