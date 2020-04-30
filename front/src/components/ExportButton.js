import React, { useState } from "react";
import { API } from "aws-amplify";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Button, Progress } from "reactstrap";

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
    body: {
      size: 1000,
      query: query.query,
    },
  });
};

let scroll = (index, scrollId) => {
  return API.post("api", `/es/search/${index}/scroll?scroll=5m&scroll_id=${scrollId}`, {
    body: {
      scroll: true,
      scroll_id: scrollId,
      activeQuery: {
        scroll: "1m",
        scroll_id: scrollId,
      },
    },
  });
};

let getDataAsCSV = async (searchUrl, query, columns, setProgress) => {
  let data = [];
  let pushAll = (hits) => {
    let total = hits.total.value;
    data = [...data, ...hits.hits.map((h) => h._source)];
    setProgress(Math.round((data.length * 100) / total));
  };

  let { hits, _scroll_id } = await search(searchUrl, query);
  pushAll(hits);

  while (data.length < hits.total.value) {
    let { hits } = await scroll(searchUrl, _scroll_id);
    pushAll(hits);
  }

  let headers = columns.map((c) => c.header).join(CSV_SEPARATOR) + "\n";
  let lines = data.map((obj) => serializeObject(columns, obj)).join("\n");
  setProgress(100);
  return `${headers}${lines}`;
};

const ExportButton = ({ index, filters, columns }) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState({ query: { match_all: {} } });

  return (
    <ReactiveComponent
      componentId={`${index}-export`}
      react={{ and: filters }}
      onQueryChange={(prevQuery, nextQuery) => setQuery(nextQuery)}
      render={() => {
        if (exporting) {
          return (
            <Progress min={0} max={100} value={progress}>
              {progress}%
            </Progress>
          );
        }

        return (
          <Button
            size="sm"
            onClick={async () => {
              setExporting(true);
              let csv = await getDataAsCSV(index, query, columns, setProgress);
              let fileName = `${index}_${new Date().toJSON()}.csv`;
              downloadCSV(fileName, csv);
              setExporting(false);
              setProgress(0);
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
