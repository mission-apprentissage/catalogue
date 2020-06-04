import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "reactstrap";

import { API } from "aws-amplify";

import "./formation.css";

export default ({ match }) => {
  const [formation, setFormation] = useState(null);
  useEffect(() => {
    async function run() {
      try {
        const resp = await API.get("api", `/formation/${match.params.id}`);
        setFormation(resp);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [match]);

  if (!formation) {
    return (
      <div>
        <Spinner color="secondary" />
      </div>
    );
  }
  return (
    <div className="page formation">
      <div className="notice">
        <Container>
          <h1 className="heading">{formation.intitule_long}</h1>
          <Row>
            <Col md="8">
              <div className="notice-details">
                <h2 className="small">Détails</h2>
                <div className="field">
                  <h3>Diplôme ou titre visé</h3>
                  <p>{formation.diplome}</p>
                </div>
                <div className="field">
                  <h3>Niveau de la formation</h3>
                  <p>{formation.niveau}</p>
                </div>
                <div className="field">
                  <h3>Code diplôme (Éducation Nationale)</h3>
                  <p>{formation.educ_nat_code}</p>
                </div>
                <div className="field">
                  <h3>Intitulé court de la formation</h3>
                  <p>{formation.intitule_court}</p>
                </div>
                <div className="field">
                  <h3>Organisme Habilité (RNCP)</h3>
                  <p>{formation.rncp_etablissement_reference_habilite}</p>
                </div>
                <div className="field">
                  <h3>Éligible apprentissage (RNCP)</h3>
                  <p>{formation.rncp_eligible_apprentissage}</p>
                </div>
                <div className="field">
                  <h3>Intitulé RNCP</h3>
                  <p>{formation.rncp_intitule}</p>
                </div>
                <div className="field">
                  <h3>Codes ROME</h3>
                  <p>{formation.rome_codes}</p>
                </div>
                <div className="field">
                  <h3>Code MEF 10 caractères</h3>
                  <p>{formation.mef_10_code}</p>
                </div>
                <div className="field">
                  <h3>Référencé dans ParcourSup</h3>
                  <p>{formation.parcoursup_reference}</p>
                </div>
                <div className="field">
                  <h3>À charger dans ParcourSup</h3>
                  <p>{formation.parcoursup_a_charger}</p>
                </div>
                <div className="field">
                  <h3>Période d'inscription</h3>
                  <p>{formation.periode}</p>
                </div>
                <div className="field">
                  <h3>Capacite d'accueil</h3>
                  <p>{formation.capacite}</p>
                </div>
                <div className="field">
                  <h3>Durée de la formation</h3>
                  <p>{formation.duree}</p>
                </div>
                <div className="field">
                  <h3>Année</h3>
                  <p>{formation.annee}</p>
                </div>
              </div>
            </Col>
            <Col md="4">
              <div className="sidebar-section info">
                <h2>À propos</h2>
                <div>
                  <div className="field multiple">
                    <div>
                      <h3>Type</h3>
                      <p>{formation.etablissement_reference_type}</p>
                    </div>
                    <div>
                      <h3>UAI</h3>
                      <p>{formation.uai_formation}</p>
                    </div>
                  </div>
                  <div className="field">
                    <h3>Établissement conventionné ?</h3>
                    <p>{formation.etablissement_reference_conventionne}</p>
                  </div>
                  <div className="field">
                    <h3>Établissement déclaré en préfecture ?</h3>
                    <p>{formation.etablissement_reference_declare_prefecture}</p>
                  </div>
                  <div className="field">
                    <h3>Organisme certifié 2015 ? (datadocké)</h3>
                    <p>{formation.etablissement_reference_datadock}</p>
                  </div>
                  <div className="field multiple">
                    <div>
                      <h3>Académie</h3>
                      <p>
                        {formation.nom_academie} ({formation.num_academie})
                      </p>
                    </div>
                    <div>
                      <h3>Code localité</h3>
                      <p>
                        postal: {formation.code_postal} <br />
                        commune: {formation.code_commune_insee}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sidebar-section info">
                <h2>Organisme Responsable</h2>
                <div>
                  {formation.etablissement_responsable_enseigne && (
                    <div className="field">
                      <h3>Enseigne</h3>
                      <p>{formation.etablissement_responsable_enseigne}</p>
                    </div>
                  )}
                  {formation.entreprise_raison_sociale && (
                    <div className="field">
                      <h3>Raison sociale</h3>
                      <p>{formation.entreprise_raison_sociale}</p>
                    </div>
                  )}
                  <div className="field">
                    <h3>Uai</h3>
                    <p>{formation.etablissement_responsable_uai}</p>
                  </div>
                  <div className="field">
                    <h3>Siret</h3>
                    <p>{formation.etablissement_responsable_siret}</p>
                  </div>
                  <Button color="primary">Voir plus de détails</Button>
                </div>
              </div>
              <div className="sidebar-section info">
                <h2>Organisme Formateur</h2>
                <div>
                  {formation.etablissement_formateur_enseigne && (
                    <div className="field">
                      <h3>Enseigne</h3>
                      <p>{formation.etablissement_formateur_enseigne}</p>
                    </div>
                  )}
                  {formation.entreprise_raison_sociale && (
                    <div className="field">
                      <h3>Raison sociale</h3>
                      <p>{formation.entreprise_raison_sociale}</p>
                    </div>
                  )}
                  <div className="field">
                    <h3>Uai</h3>
                    <p>{formation.etablissement_formateur_uai}</p>
                  </div>
                  <div className="field">
                    <h3>Siret</h3>
                    <p>{formation.etablissement_formateur_siret}</p>
                  </div>
                  <Button color="primary">Voir plus de détails</Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};
