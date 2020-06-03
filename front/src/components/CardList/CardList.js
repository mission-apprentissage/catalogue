/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";

import "./cardList.css";

import image_preview from "./noimage.png";

const CardList = ({ data }) => {
  const ImageComponent = <img src={image_preview} alt={data.intitule_court} />;
  return (
    <Link to={`/formation/${data._id}`} className="list-card" style={{ textDecoration: "none" }}>
      <div className="list-card-container ">
        <div className="thumbnail">{ImageComponent}</div>
        <div className="content">
          <div style={{ display: "flex" }}>
            <h2>
              {data.intitule_long}
              <br />
              <small>{data.diplome}</small>
            </h2>
            <span>
              <small className="base">{data.niveau}</small>
              <br />
              {data.educ_nat_code}
            </span>
          </div>
          <div>
            <p>{data.nom_academie}</p>
            <p>{data.code_postal}</p>
            <p>{data.entreprise_raison_sociale}</p>
            <p>{data.etablissement_formateur_enseigne}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardList;
