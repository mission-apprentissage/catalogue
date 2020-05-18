import React from "react";
import { Container, Row, Col } from "reactstrap";

//import routes from "../../routes.json";

import "./howToReglement.css";

const HowToReglement = () => {
  return (
    <div className="page howToReglement">
      <Container className="mt-5">
        <Row>
          <Col xs="12" className="mission-summary">
            <h2 className="mt-3 mb-3">Conditions d’intégration de l’offre de formation en Apprentissage</h2>
            <br />
            <h5>
              Rappel des conditions d’intégration de l’offre de formation en Apprentissage sur Parcoursup et Affelnet{" "}
            </h5>
            <h6>(cf note Dgesip 18.02.2020)</h6>
            <br />
            <p>
              <strong>
                Avant de référencer l’établissement et son offre de formation en apprentissage, les services académiques
                vérifient leur éligibilité.
              </strong>{" "}
              L’établissement doit en amont d’une demande d’intégration s’assurer que les informations le concernant
              sont à jour.
            </p>
            <br />
            <span className="purple">
              En violet, les actions déjà réalisées pour faciliter les travaux de référencement :
            </span>
            <br />
            <br />
            <ul>
              <li className="mt-1">
                <span className="underline">Doivent intégrer</span> la plateforme Parcoursup :
                <ul>
                  <li>
                    toutes les formations en apprentissage du premier cycle d'enseignement supérieur, y compris celles
                    non délivrées au nom de l’Etat pour les établissements publics, privés sous contrat ou labellisés «
                    EESPIG»
                    <ul>
                      <li className="purple">Aucun traitement </li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations en apprentissage pour les établissements privés ni sous contrat ni EESPIG qui
                    attestent d’une convention signée avec la région
                    <ul>
                      <li className="purple">Recherche UAI dans fichier DEPP 950</li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations en apprentissage pour les établissements privés ni sous contrat ni EESPIG qui
                    sont déclarés en préfecture et qui attestent de leur qualité au sens du décret du 30 juin 2015
                    émanant de l’organisme certificateur et référencé sur le site internet du CNEFOP
                    <ul>
                      <li className="purple">Recherche via le Siret dans fichier DGEFP</li>
                      <li className="purple">+ Recherche via le Siret dans DATADOCK mention “Datadocké”</li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations en apprentissage enregistrées au RNCP, ou tout titre ou diplôme délivré au nom
                    de l’Etat, hors préparation au BTS, dès lors que l’établissement est habilité à délivrer le titre et
                    que le titre est réalisé par voie d’apprentissage.
                    <ul>
                      <li className="purple">Recherche données de France Compétences</li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li className="mt-1">
                <span className="underline">Doivent intégrer</span> la plateforme Affelnet :
                <ul>
                  <li>
                    toutes les formations en apprentissage pré-bac y compris celles non délivrées au nom de l’Etat pour
                    les établissements publics, privés sous contrat
                    <ul>
                      <li className="purple">Aucun traitement </li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations en apprentissage pour les établissements privés hors contrat qui attestent
                    d’une convention signée avec la région
                    <ul>
                      <li className="purple">Recherche UAI dans fichier DEPP 950</li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations en apprentissage pour les établissements privés hors contrat qui sont déclarés
                    en préfecture et qui attestent de leur qualité au sens du décret du 30 juin 2015 émanant de
                    l’organisme certificateur et référencé sur le site internet du CNEFOP
                    <ul>
                      <li className="purple">Recherche via le Siret dans fichier DGEFP</li>
                      <li className="purple">+ Recherche via le Siret dans DATADOCK mention “Datadocké”</li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations en apprentissage enregistrées au RNCP, ou tout titre ou diplôme délivré au nom
                    de l’Etat, dès lors que l’établissement est habilité à délivrer le titre et que le titre est réalisé
                    par voie d’apprentissage.
                    <ul>
                      <li className="purple">Recherche données de France Compétences</li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li className="mt-4">
                <span className="underline">Peuvent intégrer</span> la plateforme Parcoursup{" "}
                <strong>sous réserve de vérifications/ validations de la part des référents en académie </strong>
                <ul>
                  <li>
                    toutes les formations en apprentissage pour les établissements privés ni sous contrat ni EESPIG qui
                    sont déclarés en préfecture et qui sont “inconnus de Datadock” ou “non Datadockés” mais référencés
                    par un certificateur désigné sur le site internet du CNEFOP
                    <ul>
                      <li className="purple">Recherche SIRET dans fichier DGEFP </li>
                      <li className="purple">
                        + Recherche via le Siret dans DATADOCK mention inconnu de DATADOCK ou pas datadocké
                      </li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations enregistrées au RNCP, dont les préparations au BTS, (y compris lorsqu’elles
                    sont proposées par un établissement non reconnu spécifiquement par l’Etat à ce titre ) et pour
                    lesquelles l'établissement est soit l’autorité responsable de la certification, soit partenaire de
                    l’autorité certificatrice <strong>et</strong> que le titre est réalisé par voie d’apprentissage.
                    <ul>
                      <li className="purple">Recherche données de France Compétences</li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li className="mt-4">
                <span className="underline">Peuvent intégrer</span> la plateforme Affelnet{" "}
                <strong>sous réserve de vérifications/ validations de la part des référents en académie </strong>
                <ul>
                  <li>
                    toutes les formations en apprentissage pour les établissements privés ni sous contrat ni EESPIG qui
                    sont déclarés en préfecture et qui sont “inconnus de Datadock” ou “non Datadockés” mais référencés
                    par un certificateur désigné sur le site internet du CNEFOP
                    <ul>
                      <li className="purple">Recherche SIRET dans fichier DGEFP </li>
                      <li className="purple">
                        + Recherche via le Siret dans DATADOCK mention inconnu de DATADOCK ou pas datadocké
                      </li>
                    </ul>
                  </li>
                  <li>
                    toutes les formations enregistrées au RNCP, (y compris lorsqu’elles sont proposées par un
                    établissement non reconnu spécifiquement par l’Etat à ce titre) et pour lesquelles l'établissement
                    est soit l’autorité responsable de la certification, soit partenaire de l’autorité certificatrice{" "}
                    <strong>et</strong>
                    que le titre est réalisé par voie d’apprentissage.
                    <ul>
                      <li className="purple">Recherche données de France Compétences</li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li className="mt-4">
                <span className="underline">Ne peuvent intégrer</span> les plateformes Parcoursup et Affelnet les
                formations ne remplissant pas les conditions ci-dessus.
                <ul>
                  <li>
                    <ul>
                      <li className="purple">Traitement automatiques réalisés ci-dessus</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>

            <h4>Ressources disponibles pour les vérifications préalables</h4>
            <p>
              Avant de référencer l’établissement et son offre de formation en apprentissage, les services académiques
              vérifient leur éligibilité et s’assurent que les conditions évoquées ci-dessus sont effectivement
              remplies.
            </p>
            <strong>Concernant l'établissement de formation :</strong>
            <ul className="mt-2">
              <li>
                la <strong>Base Centrale des Etablissements (BCE)</strong>, consultable sur{" "}
                <a href="https://www.education.gouv.fr/acce_public/index.php" target="_blank" rel="noreferrer noopener">
                  l’application de consultation et cartographie des établissements (ACCE)
                </a>
                ,
                <ul>
                  <li>
                    l’établissement peut solliciter la mise à jour de ses données (dénomination officielle,
                    immatriculation UAI,...) via le formulaire « Contact » du site ACCE ;
                  </li>
                </ul>
              </li>
              <li>
                <a href="http://www.cnefop.gouv.fr/qualite/" target="_blank" rel="noreferrer noopener">
                  le site internet du CNEFOP
                </a>{" "}
                listant les certifications et labels qualité satisfaisants au Décret du 30 juin 2015
                <ul>
                  <li>
                    l’établissement peut ainsi produire l’attestation de qualité émanant de l’organisme certificateur
                    référencé
                  </li>
                </ul>
              </li>
              <li>
                <a href="https://www.insee.fr/fr/information/1972062" target="_blank" rel="noreferrer noopener">
                  le site de l’INSEE
                </a>
                , permettant d’accéder aux données administratives à partir du Siret de l'établissement
                <ul>
                  <li>
                    L’établissement peut y signaler des modifications (changement d'adresse, de statut, d'activité, de
                    raison sociale, ouverture ou fermeture d'un établissement...) afin qu’elles soient mises à jour.
                  </li>
                </ul>
              </li>
            </ul>
            <strong>Concernant la formation :</strong>
            <ul className="mt-2 mb-5">
              <li>
                <a href="https://certificationprofessionnelle.fr/recherche" target="_blank" rel="noreferrer noopener">
                  le Répertoire national des certifications professionnelles (RNCP)
                </a>{" "}
                listant les certificateurs référencés pour chacune des certifications enregistrées au RNCP (hors
                Répertoire Spécifique)
                <ul>
                  <li>
                    il appartient à l'établissement de se rapprocher du certificateur pour solliciter la mise à jour
                    éventuelle des données (validité, certificateur et/ou établissements partenaires, voie(s)
                    d’accès...) ;
                  </li>
                </ul>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HowToReglement;
