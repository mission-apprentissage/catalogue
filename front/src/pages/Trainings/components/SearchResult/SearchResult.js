import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MultiDropdownList } from "@appbaseio/reactivesearch";
import {
  Button,
  Form,
  FormGroup,
  InputGroup,
  Input,
  InputGroupAddon,
  UncontrolledPopover,
  PopoverBody,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleRight, faPen, faTimes, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import { API } from "aws-amplify";
import { validateCell } from "../../../../services/validators";

import columnsDefinition from "./columnsDefinition.json";

import "./searchResult.css";

const Filter = React.memo(props => {
  const { componentId, dataField, filterLabel, filters } = props;
  return (
    <MultiDropdownList
      className="filter"
      componentId={componentId}
      dataField={dataField}
      title=""
      size={20000}
      showRadio={true}
      showCount={true}
      showSearch={true}
      react={{ and: filters }}
      placeholder="Filtrer"
      searchPlaceholder="Rechercher"
      showFilter={true}
      filterLabel={filterLabel}
      URLParams={true}
      loader="Chargement ..."
      defaultQuery={() => {
        return {
          query: {
            match: {
              published: true,
            },
          },
        };
      }}
      {...props}
    />
  );
});

const BooleanFilter = React.memo(({ dataField, ...props }) => {
  return (
    <Filter
      dataField={dataField}
      componentId={dataField}
      filterLabel={dataField}
      customQuery={data => {
        return !data || data.length === 0
          ? {}
          : {
              query: {
                match: {
                  [dataField]: data[0] === "OUI",
                },
              },
            };
      }}
      transformData={data => {
        return data.map(d => ({ ...d, key: d.key === "1" ? "OUI" : "NON" }));
      }}
      {...props}
    />
  );
});

const EditionCell = React.memo(({ initValue, id, fieldName, fieldType, onClose, onSubmit }) => {
  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      content: initValue,
    },
    onSubmit: ({ content }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        let body = {};
        body[fieldName] = content;
        const result = await API.put("api", `/formation/${id}`, { body });
        console.log(result);
        setSubmitting(false);
        onSubmit(content);
        resolve("onSubmitHandler complete");
      });
    },
  });
  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
        <InputGroup>
          <Input type={fieldType} name="content" onChange={handleChange} value={values.content} />
          <InputGroupAddon addonType="prepend">
            <Button type="submit" color="success">
              <FontAwesomeIcon icon={faArrowCircleRight} />
            </Button>
            <Button type="submit" color="danger" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
    </Form>
  );
});

const checkIsValid = (hasRightToEdit, accessor, value) => {
  return hasRightToEdit ? validateCell(accessor, value) : true;
};

const checkIfHasRightToEdit = (item, column, value, userAcm) => {
  let hasRightToEdit = userAcm.all;
  if (!hasRightToEdit) {
    hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
  }
  return (
    hasRightToEdit &&
    (column.editable ||
      (column.editableEmpty && value === "") ||
      (column.editableInvalid && !validateCell(column.accessor, value)))
  );
};

const Cell = ({ item, id, column }) => {
  const { acm: userAcm } = useSelector(state => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item[column.accessor] === null ? "" : item[column.accessor]);

  if (value === undefined) {
    throw new Error(`Unable to render Cell for "${column.accessor}" because value is undefined`);
  }

  const hasRightToEdit = checkIfHasRightToEdit(item, column, value, userAcm);
  const edition = hasRightToEdit && isEditing;
  const isValid = React.useMemo(() => checkIsValid(hasRightToEdit, column.accessor, value), [
    column.accessor,
    hasRightToEdit,
    value,
  ]);

  let getValueAsString = () => {
    if (typeof value === "boolean") {
      return value ? "OUI" : "NON";
    }
    if (Array.isArray(value)) {
      return value.join(",");
    }

    return value;
  };

  return (
    <td>
      <div
        style={{
          width: `${edition ? column.width + (column.editorInput === "textarea" ? 150 : 100) : column.width}px`,
          height: `${edition ? (column.editorInput === "textarea" ? 100 : 40) : 20}px`,
        }}
        className="cell-content"
      >
        {edition ? (
          <EditionCell
            initValue={value}
            id={item._id}
            fieldName={column.accessor}
            fieldType={column.editorInput}
            onSubmit={val => {
              setValue(val);
              setIsEditing(!isEditing);
            }}
            onClose={() => setIsEditing(!isEditing)}
          />
        ) : value.length > 20 ? (
          <Button
            id={`PopoverFocus_${id}`}
            type="text"
            color="link"
            className="popover-btn"
            style={{
              width: `${edition ? column.width + 50 : column.width}px`,
            }}
          >
            {value}
          </Button>
        ) : (
          <div className="cell-text">{getValueAsString()}</div>
        )}
        {!edition && !isValid && <FontAwesomeIcon className="invalid-value" icon={faExclamationCircle} size="xs" />}
        {hasRightToEdit && !isEditing && (
          <Button className="edit-btn input-group-text" type="submit" onClick={() => setIsEditing(!isEditing)}>
            <FontAwesomeIcon icon={faPen} size="xs" />
          </Button>
        )}
      </div>
      {!edition && value.length > 20 && (
        <UncontrolledPopover trigger="legacy" placement="auto" target={`PopoverFocus_${id}`}>
          <PopoverBody>{value}</PopoverBody>
        </UncontrolledPopover>
      )}
    </td>
  );
};

const SearchResult = ({ data, filters, debug }) => {
  return (
    <div className="search-result">
      <table className="table table-hover">
        <thead>
          <tr className="result-table-head">
            {columnsDefinition.map((column, i) => {
              if (column.debug && !debug) {
                return null;
              }
              return (
                <th key={i}>
                  <div style={{ width: `${column.width}px` }}>{column.Header}</div>
                  {column.accessor === "siren" && (
                    <Filter
                      componentId="siren"
                      dataField="siren.keyword"
                      filterLabel="siren"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_responsable_siret" && (
                    <Filter
                      componentId="etablissement_responsable_siret"
                      dataField="etablissement_responsable_siret.keyword"
                      filterLabel="etablissement_responsable_siret"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_formateur_siret" && (
                    <Filter
                      componentId="etablissement_formateur_siret"
                      dataField="etablissement_formateur_siret.keyword"
                      filterLabel="etablissement_formateur_siret"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_formateur_uai" && (
                    <Filter
                      componentId="etablissement_formateur_uai"
                      dataField="etablissement_formateur_uai.keyword"
                      filterLabel="etablissement_formateur_uai"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_responsable_uai" && (
                    <Filter
                      componentId="etablissement_responsable_uai"
                      dataField="etablissement_responsable_uai.keyword"
                      filterLabel="etablissement_responsable_uai"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "ds_id_dossier" && (
                    <Filter
                      componentId="ds_id_dossier"
                      dataField="ds_id_dossier.keyword"
                      filterLabel="ds_id_dossier"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "niveau" && (
                    <Filter
                      componentId="niveau"
                      dataField="niveau.keyword"
                      filterLabel="niveau"
                      filters={filters.filter(e => e !== "niveau")}
                      sortBy="count"
                      // showMissing={true}
                      // missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "duree" && (
                    <Filter
                      componentId="duree"
                      dataField="duree.keyword"
                      filterLabel="duree"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "annee" && (
                    <Filter
                      componentId="annee"
                      dataField="annee.keyword"
                      filterLabel="annee"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "uai_formation" && (
                    <Filter
                      componentId="uai_formation"
                      dataField="uai_formation.keyword"
                      filterLabel="uai_formation"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "code_postal" && (
                    <Filter
                      componentId="codePostal"
                      dataField="code_postal.keyword"
                      filterLabel="codePostal"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "code_commune_insee" && (
                    <Filter
                      componentId="codeCommuneInsee"
                      dataField="code_commune_insee.keyword"
                      filterLabel="codeCommuneInsee"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "num_academie" && (
                    <Filter
                      componentId="num_academie"
                      dataField="num_academie"
                      filterLabel="num_academie"
                      filters={filters}
                      sortBy="asc"
                    />
                  )}
                  {column.accessor === "num_academie_siege" && (
                    <Filter
                      componentId="num_academie_siege"
                      dataField="num_academie_siege"
                      filterLabel="num_academie_siege"
                      filters={filters}
                      sortBy="asc"
                    />
                  )}
                  {column.accessor === "num_departement" && (
                    <Filter
                      componentId="num_departement"
                      dataField="num_departement.keyword"
                      filterLabel="num_departement"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "nom_academie" && (
                    <Filter
                      componentId="nomAcademie"
                      dataField="nom_academie.keyword"
                      filterLabel="nomAcademie"
                      filters={filters}
                      sortBy="asc"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "source" && (
                    <Filter
                      componentId="source"
                      dataField="source.keyword"
                      filterLabel="source"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "educ_nat_code" && (
                    <Filter
                      componentId="educ_nat_code"
                      dataField="educ_nat_code.keyword"
                      filterLabel="educ_nat_code"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_reference_type" && (
                    <Filter
                      componentId="etablissement_reference_type"
                      dataField="etablissement_reference_type.keyword"
                      filterLabel="etablissement_reference_type"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_reference_conventionne" && (
                    <Filter
                      componentId="etablissement_reference_conventionne"
                      dataField="etablissement_reference_conventionne.keyword"
                      filterLabel="etablissement_reference_conventionne"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_reference_declare_prefecture" && (
                    <Filter
                      componentId="etablissement_reference_declare_prefecture"
                      dataField="etablissement_reference_declare_prefecture.keyword"
                      filterLabel="etablissement_reference_declare_prefecture"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "etablissement_reference_datadock" && (
                    <Filter
                      componentId="etablissement_reference_datadock"
                      dataField="etablissement_reference_datadock.keyword"
                      filterLabel="etablissement_reference_datadock"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "intitule_long" && (
                    <Filter
                      componentId="intitule_long"
                      dataField="intitule_long.keyword"
                      filterLabel="intitule_long"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "intitule_court" && (
                    <Filter
                      componentId="intitule_court"
                      dataField="intitule_court.keyword"
                      filterLabel="intitule_court"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "parcoursup_a_charger" && (
                    <BooleanFilter dataField="parcoursup_a_charger" filters={filters} sortBy="count" />
                  )}
                  {column.accessor === "rncp_etablissement_reference_habilite" && (
                    <BooleanFilter dataField="rncp_etablissement_reference_habilite" filters={filters} sortBy="count" />
                  )}
                  {column.accessor === "rncp_eligible_apprentissage" && (
                    <BooleanFilter dataField={"rncp_eligible_apprentissage"} filters={filters} sortBy="count" />
                  )}
                  {column.accessor === "rome_codes" && (
                    <Filter
                      componentId="rome_codes"
                      dataField="rome_codes.keyword"
                      filterLabel="rome_codes"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "rncp_code" && (
                    <Filter
                      componentId="rncp_code"
                      dataField="rncp_code.keyword"
                      filterLabel="rncp_code"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "mef_10_code" && (
                    <Filter
                      componentId="mef_10_code"
                      dataField="mef_10_code.keyword"
                      filterLabel="mef_10_code"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "mef_8_code" && (
                    <Filter
                      componentId="mef_8_code"
                      dataField="mef_8_code.keyword"
                      filterLabel="mef_8_code"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "mef_8_codes" && (
                    <Filter
                      componentId="mef_8_codes"
                      dataField="mef_8_codes.keyword"
                      filterLabel="mef_8_codes"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "parcoursup_reference" && (
                    <Filter
                      componentId="parcoursup_reference"
                      dataField="parcoursup_reference.keyword"
                      filterLabel="parcoursup_reference"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "diplome" && (
                    <Filter
                      componentId="diplome"
                      dataField="diplome.keyword"
                      filterLabel="diplome"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((obj, i) => {
            return (
              <tr key={obj._id}>
                {columnsDefinition.map((column, j) => {
                  if (column.debug && !debug) {
                    return null;
                  }
                  return <Cell key={j} item={obj} id={`${i}_${j}`} column={column} />;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(SearchResult);
