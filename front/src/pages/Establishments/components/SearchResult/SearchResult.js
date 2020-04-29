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

const Filter = React.memo((props) => {
  const { componentId, dataField, filterLabel, filters } = props;
  return (
    <MultiDropdownList
      className="filter"
      componentId={componentId}
      dataField={dataField}
      title=""
      size={2000}
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
        const result = await API.put("api", `/etablissement/${id}`, { body });
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

const Cell = ({ item, id, column }) => {
  const { acm: userAcm } = useSelector((state) => state.user);

  let hasRightToEdit = userAcm.all;
  if (!hasRightToEdit) {
    hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
  }

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item[column.accessor] || "");

  hasRightToEdit = hasRightToEdit && (column.editable || (column.editableEmpty && value === ""));

  const edition = hasRightToEdit && isEditing;
  const isValid = React.useMemo(() => checkIsValid(hasRightToEdit, column.accessor, value), [
    hasRightToEdit,
    column.accessor,
    value,
  ]);

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
            onSubmit={(val) => {
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
          <div className="cell-text"> {value}</div>
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

const SearchResult = ({ data, filters, loading }) => {
  return (
    <div className="search-result">
      <table className="table table-hover">
        <thead>
          <tr className="result-table-head">
            {columnsDefinition.map((column, i) => {
              return (
                <th key={i}>
                  <div style={{ width: `${column.width}px` }}>{column.Header}</div>
                  {column.accessor === "siren" && (
                    <Filter
                      componentId="SIREN"
                      dataField="siren.keyword"
                      filterLabel="Sirens"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "siret" && (
                    <Filter
                      componentId="SIRET"
                      dataField="siret.keyword"
                      filterLabel="Sirets"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "uai" && (
                    <Filter
                      componentId="UAI"
                      dataField="uai.keyword"
                      filterLabel="Uais"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "code_postal" && (
                    <Filter
                      componentId="CP"
                      dataField="code_postal.keyword"
                      filterLabel="CPs"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "code_insee_localite" && (
                    <Filter
                      componentId="CC"
                      dataField="code_insee_localite.keyword"
                      filterLabel="CCs"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "computed_type" && (
                    <Filter
                      componentId="type"
                      dataField="computed_type.keyword"
                      filterLabel="type"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "computed_conventionne" && (
                    <Filter
                      componentId="conventionne"
                      dataField="computed_conventionne.keyword"
                      filterLabel="conventionne"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "computed_declare_prefecture" && (
                    <Filter
                      componentId="declarePrefecture"
                      dataField="computed_declare_prefecture.keyword"
                      filterLabel="declarePrefecture"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "computed_info_datadock" && (
                    <Filter
                      componentId="infoDataDock"
                      dataField="computed_info_datadock.keyword"
                      filterLabel="infoDataDock"
                      filters={filters}
                      sortBy="count"
                      showMissing={true}
                      missingLabel="(Vide)"
                    />
                  )}
                  {column.accessor === "num_academie" && (
                    <Filter
                      componentId="numAcademie"
                      dataField="num_academie"
                      filterLabel="numAcademie"
                      filters={filters}
                      sortBy="asc"
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
