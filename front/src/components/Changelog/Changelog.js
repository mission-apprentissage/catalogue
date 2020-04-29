import React, { useState, useEffect } from "react";

import ChangelogList from "./components/ChangelogList";
import ChangelogFilter from "./components/ChangelogFilter";

import "./changelog.css";

const Changelog = ({ content, order, showVersion, hideFilter }) => {
  const [list, setList] = useState([]);
  const [versions, setVersions] = useState([]);
  const [filter, setFilter] = useState({
    improvement: false,
    bugFix: false,
    feature: false,
  });
  useEffect(() => {
    const mList = showVersion === "last2" ? content.list.slice(0, 2) : content.list;
    const mversions = mList.map(({ version }) => {
      return {
        version,
        slug: version.replace(/\./gi, ""),
      };
    });
    setVersions(mversions);
    if (order === "desc") {
      setList([...mList].reverse());
    } else {
      setList(mList);
    }
  }, [content.list, order, showVersion]);

  const onChange = e => {
    const mfilter = { ...filter };
    mfilter[e.target.value] = !mfilter[e.target.value];
    setFilter(mfilter);
  };
  return (
    <div className="react-changelog-container">
      <div className="row">
        <div className="col-md-12">
          <div className="changelog-wrapper">
            {!hideFilter && <ChangelogFilter versions={versions} onChange={onChange} />}
            <ChangelogList list={list} filter={filter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
