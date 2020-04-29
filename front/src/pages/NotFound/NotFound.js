import React from "react";
import { Link } from "react-router-dom";

import "./notFound.css";

const NotFound = () => (
  <div className="page not-found">
    <div id="oopss">
      <div id="error-text">
        <span>404</span>
        <h1>PAGE INCONNUE</h1>
        <p className="hmpg">
          <Link to="/" className="back">
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  </div>
);

export default NotFound;
