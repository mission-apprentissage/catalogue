import React, { useState } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Button } from "reactstrap";

const MAX_SIZE = 10000;
const CSV_SEPARATOR = ";";

const serializeObject = (columns, obj) => {
  const fieldNames = columns.map((c) => c.fieldName);
  const res = [];
  for (let i = 0; i < fieldNames.length; i++) {
    let value = obj[fieldNames[i]];
    if (!value) {
      value = "";
    } else if (Array.isArray(value)) {
      if (value.length && typeof value[0] === "object") {
        value = JSON.stringify(value);
      } else {
        value = value.join(",");
      }
    } else if (typeof value === "object") {
      value = JSON.stringify(value);
    } else {
      value = `${value}`.trim().replace(/"/g, "'").replace(/;/g, ",").replace(/\n/g, "").replace(/\r/g, "");
    }
    res.push(value !== "" ? `="${value}"` : "");
  }
  return res.join(CSV_SEPARATOR);
};

const convertDataIntoCSV = (columns, data) => {
  let headers = columns.map((c) => c.header).join(CSV_SEPARATOR) + "\n";
  let lines = data.map((obj) => serializeObject(columns, obj)).join("\n");
  return `${headers}${lines}`;
};

const downloadCSV = (exportName, csv) => {
  let fileName = `${exportName}_${new Date().toJSON()}.csv`;
  let blob = new Blob([csv]);

  if (window.navigator.msSaveOrOpenBlob) {
    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    let a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob, {
      type: "text/plain;charset=UTF-8",
    });
    a.download = fileName;
    document.body.appendChild(a);
    a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }
};

const ExportButton = ({ exportName = "export", filters, columns }) => {
  const [exporting, setExporting] = useState(false);

  return (
    <ReactiveComponent
      componentId={exportName}
      react={{ and: filters }}
      onData={({ data }) => {
        if (exporting) {
          setExporting(false);
          let csv = convertDataIntoCSV(columns, data);
          downloadCSV(exportName, csv);
        }
      }}
      customQuery={() => {
        return {
          size: exporting ? MAX_SIZE : 0,
          query: { query: { match_all: {} } },
        };
      }}
      render={() => {
        if (exporting) {
          return <div>Chargement en cours</div>;
        }
        return <Button onClick={() => setExporting(true)}>Exporter</Button>;
      }}
    />
  );
};

export default React.memo(ExportButton);
