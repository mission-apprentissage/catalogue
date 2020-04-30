import React, { useState } from "react";
import { API } from "aws-amplify";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Button } from "reactstrap";

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

const downloadCSV = (fileName, csv) => {
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

let search = (index, query) => {
  return API.post("api", `/es/search/${index}/_search?scroll=5m`, {
    body: JSON.stringify({ size: 1000, query: query.query }),
  });
};

let scroll = (index, scrollId) => {
  return API.post("api", `/es/search/${index}/scroll?scroll=5m&scroll_id=${scrollId}`, {
    body: JSON.stringify({
      scroll: true,
      scroll_id: scrollId,
      activeQuery: {
        scroll: "1m",
        scroll_id: scrollId,
      },
    }),
  });
};

let getDataAsCSV = async (searchUrl, query, columns) => {
  let data = [];

  let res = await search(searchUrl, query);
  data = [...data, ...res.hits.hits.map((h) => h._source)];

  while (data.length < res.hits.total.value) {
    res = await scroll(searchUrl, res._scroll_id);
    data = [...data, ...res.hits.hits.map((h) => h._source)];
  }

  let headers = columns.map((c) => c.header).join(CSV_SEPARATOR) + "\n";
  let lines = data.map((obj) => serializeObject(columns, obj)).join("\n");
  return `${headers}${lines}`;
};

const ExportButton = ({ index, filters, columns }) => {
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState({ query: { match_all: {} } });

  return (
    <ReactiveComponent
      componentId={`${index}-export`}
      react={{ and: filters }}
      onQueryChange={(prevQuery, nextQuery) => setQuery(nextQuery)}
      render={() => {
        if (exporting) {
          return <div>Chargement en cours</div>;
        }

        return (
          <Button
            onClick={async () => {
              setExporting(true);
              let csv = await getDataAsCSV(index, query, columns);
              let fileName = `${index}_${new Date().toJSON()}.csv`;
              downloadCSV(fileName, csv);
              setExporting(false);
            }}
          >
            Exporter
          </Button>
        );
      }}
    />
  );
};

export default React.memo(ExportButton);
