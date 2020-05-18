import React, { useState } from "react";
import { useSelector } from "react-redux";
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

import columnsDefinition from "./columnsDefinition.json";

import "./searchResult.css";

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

const checkIfHasRightToEdit = (item, column, value, userAcm) => {
  let hasRightToEdit = userAcm.all;
  if (!hasRightToEdit) {
    hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
  }
  return hasRightToEdit && (column.editable || (column.editableEmpty && value === "") || column.editableInvalid);
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
        {!edition && <FontAwesomeIcon className="invalid-value" icon={faExclamationCircle} size="xs" />}
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
