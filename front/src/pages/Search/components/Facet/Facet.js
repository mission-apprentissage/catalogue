import React, { useState } from "react";
import { MultiList } from "@appbaseio/reactivesearch";
import { Collapse, CardBody, Card, CardHeader } from "reactstrap";
import { useSelector } from "react-redux";

import "./facet.css";

const Layout = props => {
  const { componentId, dataField, filterLabel, filters, title, selectAllLabel, sortBy } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { acm: userAcm } = useSelector(state => state.user);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card className="facet">
      <CardHeader onClick={toggle}>
        <div className="card-header-title">{title}</div>
        <div className="card-header-icon">⌄</div>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody>
          <MultiList
            className="facet"
            componentId={componentId}
            dataField={dataField}
            filterLabel={filterLabel}
            react={{ and: filters.filter(e => e !== componentId) }}
            showMissing={userAcm.all !== "false"}
            showCount={true}
            queryFormat="or"
            missingLabel="(Vide)"
            size={20000}
            selectAllLabel={selectAllLabel}
            showCheckbox={true}
            showSearch={true}
            placeholder="Filtrer..."
            showFilter={true}
            URLParams={false}
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
            sortBy={sortBy}
          />
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default Layout;
