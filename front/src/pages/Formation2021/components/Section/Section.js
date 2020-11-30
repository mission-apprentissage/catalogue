import React, { useState } from "react";
import { Collapse, CardBody, Card, CardHeader } from "reactstrap";

import "./section.css";

export default ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card className="section-formation">
      <CardHeader onClick={toggle}>
        <div className="card-header-title">{title}</div>
        <div className="card-header-icon">⌄</div>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody>{children}</CardBody>
      </Collapse>
    </Card>
  );
};
