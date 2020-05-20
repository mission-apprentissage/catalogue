import React, { useState, useCallback, useEffect } from "react";
import { Button, FormGroup, InputGroup, Input, UncontrolledPopover, PopoverBody } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

import columnsDefinition from "./columnsDefinition.json";

import "./duplicateHandler.css";

const EditionCell = ({ initValue, id, fieldName, fieldType, onChange }) => {
  const [value, setValue] = useState(initValue);

  const onChangeHandler = e => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
      <InputGroup>
        <Input type={fieldType} name="content" onChange={onChangeHandler} value={value} />
      </InputGroup>
    </FormGroup>
  );
};

const checkIfHasRightToEdit = (item, column, value, edit = false) => {
  let hasRightToEdit = edit;
  return hasRightToEdit && (column.editable || (column.editableEmpty && value === "") || column.editableInvalid);
};

const Cell = ({ item, id, column, edit, onChange }) => {
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
          height: `${edition ? (column.editorInput === "textarea" ? 100 : 40) : 60}px`,
        }}
        className="cell-content"
      >
        {edition ? (
          <EditionCell
            initValue={value}
            id={item._id}
            fieldName={column.accessor}
            fieldType={column.editorInput}
            onChange={val => {
              onChange(column.accessor, val);
            }}
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

const SelectedTraining = ({ training, onValidation, handleDeleteChange, doNotDeleteTrainings }) => {
  const [selectedTraining, setSelectedTraining] = useState(training);
  useEffect(() => {
    async function run() {
      try {
        setSelectedTraining(training);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [training]);

  const onChangeHandler = (attr, val) => {
    setSelectedTraining({ ...training, [attr]: val });
  };

  return (
    <tr className="selectedTraining">
      <td
        className="td-validation"
        style={{
          width: `200px`,
          height: `100px`,
        }}
      >
        <div
          className="cell-content padding mb-2"
          style={{
            flexDirection: `row`,
          }}
        >
          <Input
            style={{
              position: `relative`,
              marginRight: "5px",
            }}
            type="checkbox"
            name="delete"
            value={"new"}
            onChange={e => handleDeleteChange(e, "new")}
            checked={!doNotDeleteTrainings["new"]}
          />
          <span>Ne pas créer </span>
        </div>
        <Button color="success" onClick={() => onValidation(selectedTraining)}>
          Valider
        </Button>
      </td>
      {columnsDefinition.map((column, j) => {
        return (
          <Cell
            key={j}
            item={selectedTraining}
            id={`${999999999}_${j}`}
            column={column}
            edit={true}
            onChange={onChangeHandler}
          />
        );
      })}
    </tr>
  );
};

const DuplicateHandler = ({ duplicates, attrDiff, onSubmit }) => {
  const [rS, setRS] = useState(0);
  const [selectedTraining, setSelectedTraining] = useState(duplicates[0]);
  const [doNotDeleteTrainings, setDoNotDeleteTrainings] = useState({ new: true });

  const handleChange = useCallback(
    (e, i) => {
      setRS(i);
      setSelectedTraining(duplicates[i]);
    },
    [duplicates]
  );

  const handleDeleteChange = useCallback(
    (e, i) => {
      setDoNotDeleteTrainings({ ...doNotDeleteTrainings, [e.target.value]: !e.target.checked });
    },
    [doNotDeleteTrainings]
  );

  const onValidation = training => {
    onSubmit(training, doNotDeleteTrainings);
  };

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
                      height: `60px`,
                    }}
                    className="cell-content padding"
                  >
                    {selectedTraining && (
                      <div>
                        <Input
                          type="radio"
                          name="toKeep"
                          value={obj._id}
                          onChange={e => handleChange(e, i)}
                          checked={rS === i}
                        />
                        Selectionner <br />
                        source: {obj.source}
                      </div>
                    )}
                    {selectedTraining && (
                      <div>
                        <Input
                          type="checkbox"
                          name="delete"
                          value={obj._id}
                          onChange={e => handleDeleteChange(e, i)}
                          checked={!doNotDeleteTrainings[obj._id]}
                        />
                        Supprimer <br />
                      </div>
                    )}
                  </div>
                </td>
                {columnsDefinition.map((column, j) => {
                  return <Cell key={j} item={obj} id={`${i}_${j}`} column={column} />;
                })}
              </tr>
            );
          })}
          {selectedTraining && (
            <SelectedTraining
              training={selectedTraining}
              onValidation={onValidation}
              handleDeleteChange={handleDeleteChange}
              doNotDeleteTrainings={doNotDeleteTrainings}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(DuplicateHandler);
