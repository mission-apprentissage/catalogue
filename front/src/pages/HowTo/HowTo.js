import React from "react";
import { Container, Row, Col } from "reactstrap";

//import routes from "../../routes.json";

import "./howTo.css";

const HowTo = () => {
  return (
    <div className="page howTo">
      <h2 className="mt-3 mb-3">Guide de modification Catalogue</h2>
      <Container className="mt-5">
        <Row>
          <Col xs="8" className="mission-summary">
            <p>
              <h5>
                Pour modifier un champ , il vous suffit de cliquer sur le crayon, d’effectuer la modification souhaitée
                et de la valider ensuite. <br />
                <br />
                Seules les cellules avec un crayon sont modifiables.
              </h5>
            </p>
            <br />
            <p>
              Les cellules ne pouvant pas être modifiées concernent des champs issus de tables et nomenclatures
              officielles ( Api Entreprise, tables de la BCN, niveau de formation ….) Si toutefois vous constatez des
              incohérences dans les données sur ces tables, merci de le signaler :
              <ul>
                <li>
                  Au CFA qui se rapproche de l’
                  <a href="https://www.insee.fr/fr/information/1972062" target="_blank" rel="noreferrer noopener">
                    INSEE
                  </a>{" "}
                  pour les champs liés aux caractéristiques de l’établissement : raison sociale, SIRET, adresse postale,
                  …
                </li>
                <li>
                  À la{" "}
                  <a href="http://infocentre.pleiade.education.fr/bcn/" target="_blank" rel="noreferrer noopener">
                    BCN
                  </a>{" "}
                  (Banque Centrale des Nomenclatures) pour les informations relatives aux codes diplomes, intitulés,
                  niveau
                </li>
                <li>A la DEPP pour les informations relatives aux UAI</li>
              </ul>
            </p>
            <h5>Modifications unitaires :</h5>
            <p>
              Un champs de la base révèle une erreur et vous souhaitez la corriger : utiliser l’interface de
              modification en vous connectant avec votre identifiant et mot de passe.
            </p>
            <h5>Modifications en masse :</h5>
            <p>
              Vous remarquez la même erreur sur plusieurs champs, merci de le signaler à la mission apprentissage en
              envoyant un mail au contact mentionné en support. Ce mail doit contenir des informations suivantes : UAI
              établissement, numéro de siret, numéro de dossier Démarches Simplifiées s’il existe, une description de
              l’erreur rencontrée et une copie écran.
            </p>
            <h5>Modifications en cascade et impacts de vos modifications :</h5>
            <p>
              Une modification d’un champ dans l’onglet établissement (Numéro UAI par exemple) pourra entraîner un
              changement de statut des formations qui s’y rattachent, et ainsi les rendre éligibles.
            </p>
            <h5>Liste des champs modifiables et des champs en cascade</h5>
            <p>
              <strong>Sur l’onglet formation :</strong>
              <ul>
                <li>Numéro d’académie,</li>
                <li>SIRET CFA-OFA,</li>
                <li>SIRET Formateur,</li>
                <li>Code diplôme (si le champs est vide ou qu’il contient des informations incorrectes),</li>
                <li>Période, </li>
                <li>Capacité,</li>
                <li>UAI formation, </li>
                <li>Code postal.</li>
              </ul>
              <strong>Sur l’onglet établissements :</strong>
              <ul>
                <li>UAI, </li>
                <li>Nom commercial.</li>
              </ul>
            </p>
            <p>
              Du <strong>SIREN</strong> on déduit : SIRET Siège Social, Raison Sociale, Code Entreprise, Date de
              création, Code NAF, Libellé code NAF, Adresse, Numéro de voie, Type de Voie, Nom de la voie, Complément
              d’adresse, Code postal, Localité, Code commune INSEE
              <br />
              <br />
              Du <strong>code diplôme</strong> on déduit : Intitulé du diplôme, Intitulé de la formation, niveau.
              <br />
              <br />
              Du <strong>code MEF</strong> on déduit : Durée de la formation et année de la formation, si la formation
              est déjà présente dans Parcoursup ou Affelnet.
              <br />
              <br />
              Du <strong>code RNCP</strong> on déduit : Code diplôme, Code ROME, Eligible apprentissage
              <br />
              <br />
              Du <strong>code commune insee</strong> on déduit numéro d’académie <br />
              <br />
              Du <strong>numéro d’académie</strong> on déduit le nom d’académie
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HowTo;
