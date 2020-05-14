import React from "react";
import { Container, Row, Col } from "reactstrap";

//import routes from "../../routes.json";

import "./howToReglement.css";

const HowToReglement = () => {
  return (
    <div className="page howToReglement">
      <h2 className="mt-3 mb-3">Guide de modification Catalogue</h2>
      <Container className="mt-5">
        <Row>
          <Col xs="8" className="mission-summary">
            <p>
              <h4>
                Rappel des conditions d’intégration de l’offre de formation en Apprentissage sur Parcoursup et Affelnet{" "}
              </h4>
              (cf note Dgesip 18.02.2020)
              <h5>
                <strong>
                  Avant de référencer l’établissement et son offre de formation en apprentissage, les services
                  académiques vérifient leur éligibilité.
                </strong>{" "}
                L’établissement doit en amont d’une demande d’intégration s’assurer que les informations le concernant
                sont à jour.
              </h5>
            </p>
            <br />
            <p>
              En bleu, les actions déjà réalisées pour faciliter les travaux de référencement :
              <ul>
                <li>
                  Doivent intégrer la plateforme Parcoursup :
                  <ul>
                    <li>
                      toutes les formations en apprentissage du premier cycle d'enseignement supérieur, y compris celles
                      non délivrées au nom de l’Etat pour les établissements publics, privés sous contrat ou labellisés
                      « EESPIG»
                      <ul>
                        <li>Aucun traitement </li>
                      </ul>
                    </li>
                    <li>
                      toutes les formations en apprentissage pour les établissements privés ni sous contrat ni EESPIG
                      qui attestent d’une convention signée avec la région
                      <ul>
                        <li>Recherche UAI dans fichier DEPP 950</li>
                      </ul>
                    </li>
                    <li>
                      toutes les formations en apprentissage pour les établissements privés ni sous contrat ni EESPIG
                      qui sont déclarés en préfecture et qui attestent de leur qualité au sens du décret du 30 juin 2015
                      émanant de l’organisme certificateur et référencé sur le site internet du CNEFOP
                      <ul>
                        <li>Recherche via le Siret dans fichier DGEFP</li>
                        <li>+ Recherche via le Siret dans DATADOCK mention “Datadocké”</li>
                      </ul>
                    </li>
                    <li>
                      toutes les formations en apprentissage enregistrées au RNCP, ou tout titre ou diplôme délivré au
                      nom de l’Etat, hors préparation au BTS, dès lors que l’établissement est habilité à délivrer le
                      titre et que le titre est réalisé par voie d’apprentissage.
                      <ul>
                        <li>Recherche données de France Compétences</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  Peuvent intégrer la plateforme Parcoursup sous réserve de vérifications/ validations de la part des
                  référents en académie
                  <ul>
                    <li>
                      toutes les formations en apprentissage pour les établissements privés ni sous contrat ni EESPIG
                      qui sont déclarés en préfecture et qui sont “inconnus de Datadock” ou “non Datadockés” mais
                      référencés par un certificateur désigné sur le site internet du CNEFOP
                      <ul>
                        <li>Recherche SIRET dans fichier DGEFP </li>
                        <li>+ Recherche via le Siret dans DATADOCK mention inconnu de DATADOCK ou pas datadocké</li>
                      </ul>
                    </li>
                    <li>
                      toutes les formations enregistrées au RNCP, dont les préparations au BTS, (y compris lorsqu’elles
                      sont proposées par un établissement non reconnu spécifiquement par l’Etat à ce titre ) et pour
                      lesquelles l'établissement est soit l’autorité responsable de la certification, soit partenaire de
                      l’autorité certificatrice et que le titre est réalisé par voie d’apprentissage.
                      <ul>
                        <li>Recherche données de France Compétences</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  Ne peuvent intégrer la plateforme Parcoursup les formations ne remplissant pas les conditions
                  ci-dessus.
                  <ul>
                    <li>
                      <ul>
                        <li>Traitement automatiques réalisés ci-dessus</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </p>
            <h4>Ressources disponibles pour les vérifications préalables</h4>
            <p>
              Avant de référencer l’établissement et son offre de formation en apprentissage, les services académiques
              vérifient leur éligibilité et s’assurent que les conditions évoquées ci-dessus sont effectivement
              remplies.
            </p>
            <p>
              Concernant l'établissement de formation :
              <ul>
                <li>
                  la Base Centrale des Etablissements (BCE), consultable sur l’application de consultation et
                  cartographie des établissements (ACCE),
                  <ul>
                    <li>
                      l’établissement peut solliciter la mise à jour de ses données (dénomination officielle,
                      immatriculation UAI,...) via le formulaire « Contact » du site ACCE ;
                    </li>
                  </ul>
                </li>
                <li>
                  le site internet du CNEFOP listant les certifications et labels qualité satisfaisants au Décret du 30
                  juin 2015
                  <ul>
                    <li>
                      l’établissement peut ainsi produire l’attestation de qualité émanant de l’organisme certificateur
                      référencé
                    </li>
                  </ul>
                </li>
                <li>
                  le site de l’INSEE, permettant d’accéder aux données administratives à partir du Siret de
                  l'établissement
                  <ul>
                    <li>
                      L’établissement peut y signaler des modifications (changement d'adresse, de statut, d'activité, de
                      raison sociale, ouverture ou fermeture d'un établissement...) afin qu’elles soient mises à jour.
                    </li>
                  </ul>
                </li>
              </ul>
            </p>
            <p>
              Concernant la formation :
              <ul>
                <li>
                  le Répertoire national des certifications professionnelles (RNCP) listant les certificateurs
                  référencés pour chacune des certifications enregistrées au RNCP (hors Répertoire Spécifique)
                  <ul>
                    <li>
                      il appartient à l'établissement de se rapprocher du certificateur pour solliciter la mise à jour
                      éventuelle des données (validité, certificateur et/ou établissements partenaires, voie(s)
                      d’accès...) ;
                    </li>
                  </ul>
                </li>
              </ul>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HowToReglement;
