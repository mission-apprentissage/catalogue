import React, { useState, useCallback, useEffect } from "react";
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
import { faArrowCircleRight, faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import { API } from "aws-amplify";

import columnsDefinition from "./columnsDefinition.json";

import "./duplicateHandler.css";

const EditionCell = ({ initValue, id, fieldName, fieldType, onClose, onSubmit }) => {
  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      content: initValue,
    },
    enableReinitialize: true,
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
          {/* <InputGroupAddon addonType="prepend">
            <Button type="submit" color="success">
              <FontAwesomeIcon icon={faArrowCircleRight} />
            </Button>
            <Button type="submit" color="danger" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </InputGroupAddon> */}
        </InputGroup>
      </FormGroup>
    </Form>
  );
};

const checkIfHasRightToEdit = (item, column, value, edit = false) => {
  let hasRightToEdit = edit;
  return hasRightToEdit && (column.editable || (column.editableEmpty && value === "") || column.editableInvalid);
};

const Cell = ({ item, id, column, edit }) => {
  const [isEditing, setIsEditing] = useState(edit);
  const [value, setValue] = useState(item[column.accessor] === null ? "" : item[column.accessor]);

  useEffect(() => {
    async function run() {
      try {
        setValue(item[column.accessor] === null ? "" : item[column.accessor]);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [column, item]);

  if (value === undefined) {
    throw new Error(`Unable to render Cell for "${column.accessor}" because value is undefined`);
  }

  const hasRightToEdit = checkIfHasRightToEdit(item, column, value, edit);
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
          height: `${edition ? (column.editorInput === "textarea" ? 100 : 40) : 40}px`,
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

const SelectedTraining = ({ training }) => {
  return (
    <tr className="selectedTraining">
      <td className="">
        <div
          style={{
            width: `200px`,
            height: `100px`,
          }}
          className="cell-content"
        >
          A garder
        </div>
      </td>
      {columnsDefinition.map((column, j) => {
        return <Cell key={j} item={training} id={`${999999999}_${j}`} column={column} edit={true} />;
      })}
    </tr>
  );
};

const DuplicateHandler = ({ duplicates, attrDiff }) => {
  const [rS, setRS] = useState(0);
  const [selectedTraining, setSelectedTraining] = useState(duplicates[0]);

  const handleChange = useCallback(
    (e, i) => {
      setRS(i);
      setSelectedTraining(duplicates[i]);
    },
    [duplicates]
  );

  return (
    <div className="duplicates-result">
      <table className="table table-hover">
        <thead>
          <tr className="result-table-head">
            <th>
              <div style={{ width: `200px` }}>-</div>
            </th>
            {columnsDefinition.map((column, i) => {
              if (attrDiff.includes(column.accessor)) {
                return (
                  <th key={i} className="diffTh">
                    <div style={{ width: `${column.width}px` }}>{column.Header}</div>
                  </th>
                );
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
          {duplicates.map((obj, i) => {
            return (
              <tr key={obj._id}>
                <td className="fixedTd">
                  <div
                    style={{
                      width: `200px`,
                      height: `40px`,
                    }}
                    className="cell-content padding"
                  >
                    {selectedTraining && (
                      <>
                        <Input
                          type="radio"
                          name="toKeep"
                          value={obj._id}
                          onChange={e => handleChange(e, i)}
                          checked={rS === i}
                        />
                        Selectionner <br />
                        source: {obj.source}
                      </>
                    )}
                  </div>
                </td>
                {columnsDefinition.map((column, j) => {
                  return <Cell key={j} item={obj} id={`${i}_${j}`} column={column} />;
                })}
              </tr>
            );
          })}
          {selectedTraining && <SelectedTraining training={selectedTraining} />}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(DuplicateHandler);
