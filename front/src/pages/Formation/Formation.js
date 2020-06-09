import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Input } from "reactstrap";
import { useSelector } from "react-redux";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

import Section from "./components/Section";

import "./formation.css";

const checkIfHasRightToEdit = (item, userAcm) => {
  let hasRightToEdit = userAcm.all;
  if (!hasRightToEdit) {
    hasRightToEdit = userAcm.academie.includes(`${item.num_academie}`);
  }
  return hasRightToEdit;
};

const EditSection = ({ edition, onEdit, handleSubmit }) => {
  const onDeleteClicked = () => {
    // do stuff
  };

  return (
    <div className="sidebar-section info sidebar-section-edit">
      {edition && (
        <>
          <Button className="mb-3" color="success" onClick={handleSubmit}>
            Valider
          </Button>
          <Button
            color="danger"
            onClick={() => {
              onEdit();
            }}
          >
            Annuler
          </Button>
        </>
      )}
      {!edition && (
        <>
          <Button
            className="mb-3"
            color="warning"
            onClick={() => {
              onEdit();
            }}
          >
            Éditer
          </Button>
          <Button color="danger" onClick={onDeleteClicked}>
            Supprimer
          </Button>
        </>
      )}
    </div>
  );
};

const Formation = ({ formation, edition, onEdit, handleChange, handleSubmit, values }) => {
  const { acm: userAcm } = useSelector(state => state.user);
  const oneEstablishment = formation.etablissement_responsable_siret === formation.etablissement_formateur_siret;
  const hasRightToEdit = checkIfHasRightToEdit(formation, userAcm);

  return (
    <Row>
      <Col md="7">
        <div className="notice-details">
          <h2 className="small">Détails</h2>
          <div className="field">
            <h3>Intitulé court de la formation</h3>
            <p>{formation.intitule_court}</p>
          </div>
          <div className="field">
            <h3>Diplôme ou titre visé</h3>
            <p>{formation.diplome}</p>
          </div>
          <div className="field">
            <h3>Niveau de la formation</h3>
            <p>{formation.niveau}</p>
          </div>
          <div className="field">
            <h3>
              Code diplôme (Éducation Nationale)
              {hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}
            </h3>
            <p>
              {!edition && <>{formation.educ_nat_code}</>}
              {edition && (
                <Input type="text" name="educ_nat_code" onChange={handleChange} value={values.educ_nat_code} />
              )}
            </p>
          </div>
          <div className="field">
            <h3>Code MEF 10 caractères</h3>
            <p>{formation.mef_10_code}</p>
          </div>
          <div className="field">
            <h3>
              Période d'inscription{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}
            </h3>
            <p>
              {!edition && <>{formation.periode}</>}
              {edition && <Input type="text" name="periode" onChange={handleChange} value={values.periode} />}
            </p>
          </div>
          <div className="field">
            <h3>
              Capacite d'accueil{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}
            </h3>
            <p>
              {!edition && <>{formation.capacite}</>}
              {edition && <Input type="text" name="capacite" onChange={handleChange} value={values.capacite} />}
            </p>
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
        <Section title="Information ParcourSup">
          <div className="field">
            <h3>Référencé dans ParcourSup</h3>
            <p>{formation.parcoursup_reference}</p>
          </div>
          <div className="field">
            <h3>À charger dans ParcourSup</h3>
            <p>{formation.parcoursup_a_charger ? "OUI" : "NON"}</p>
          </div>
        </Section>
        <Section title="Information RNCP">
          <div className="field">
            <h3>Code RNCP</h3>
            <p>{formation.rncp_code}</p>
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
        </Section>
        <Section title="Information ROME">
          <div className="field">
            <h3>Codes ROME</h3>
            <p>{formation.rome_codes}</p>
          </div>
        </Section>
      </Col>
      <Col md="5">
        {hasRightToEdit && <EditSection edition={edition} onEdit={onEdit} handleSubmit={handleSubmit} />}
        <div className="sidebar-section info">
          <h2>À propos</h2>
          <div>
            <div className="field multiple">
              <div>
                <h3>Type</h3>
                <p>{formation.etablissement_reference_type}</p>
              </div>
              <div>
                <h3>UAI{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
                <p>
                  {!edition && <>{formation.uai_formation}</>}
                  {edition && (
                    <Input type="text" name="uai_formation" onChange={handleChange} value={values.uai_formation} />
                  )}
                </p>
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
              <h3>Organisme certifié 2015 - datadock ?</h3>
              <p>{formation.etablissement_reference_datadock}</p>
            </div>
            <div className="field">
              <h3>Académie{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
              <p>
                {!edition && (
                  <>
                    {formation.nom_academie} ({formation.num_academie})
                  </>
                )}
                {edition && (
                  <>
                    {formation.nom_academie}{" "}
                    <Input type="text" name="num_academie" onChange={handleChange} value={values.num_academie} />
                  </>
                )}
              </p>
            </div>
            <div className="field multiple">
              <div>
                <h3>Code postal{hasRightToEdit && <FontAwesomeIcon className="edit-pen" icon={faPen} size="xs" />}</h3>
                <p>
                  {!edition && <>{formation.code_postal}</>}
                  {edition && (
                    <Input type="text" name="code_postal" onChange={handleChange} value={values.code_postal} />
                  )}
                </p>
              </div>
              <div>
                <h3>Code commune</h3>
                <p>{formation.code_commune_insee}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar-section info">
          <h2>Organisme {!oneEstablishment && "Formateur"}</h2>
          <div>
            {formation.entreprise_raison_sociale && (
              <div className="field">
                <h3>Raison sociale</h3>
                <p>{formation.entreprise_raison_sociale}</p>
              </div>
            )}
            {formation.etablissement_formateur_enseigne && (
              <div className="field">
                <h3>Enseigne</h3>
                <p>{formation.etablissement_formateur_enseigne}</p>
              </div>
            )}
            <div className="field">
              <h3>Uai</h3>
              <p>{formation.etablissement_formateur_uai}</p>
            </div>
            <div className="sidebar-section-seemore">
              <Button color="primary">Voir plus de détails</Button>
            </div>
          </div>
        </div>
        {!oneEstablishment && (
          <div className="sidebar-section info">
            <h2>Organisme Responsable</h2>
            <div>
              {formation.entreprise_raison_sociale && (
                <div className="field">
                  <h3>Raison sociale</h3>
                  <p>{formation.entreprise_raison_sociale}</p>
                </div>
              )}
              {formation.etablissement_responsable_enseigne && (
                <div className="field">
                  <h3>Enseigne</h3>
                  <p>{formation.etablissement_responsable_enseigne}</p>
                </div>
              )}
              <div className="field">
                <h3>Uai</h3>
                <p>{formation.etablissement_responsable_uai}</p>
              </div>
              <div className="sidebar-section-seemore">
                <Button color="primary">Voir plus de détails</Button>
              </div>
            </div>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default ({ match, presetFormation = null }) => {
  const [formation, setFormation] = useState(presetFormation);
  const [edition, setEdition] = useState(false);

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      uai_formation: "",
      code_postal: "",
      capacite: "",
      periode: "",
      educ_nat_code: "",
      num_academie: 0,
    },
    onSubmit: ({ uai_formation, code_postal, capacite, periode, educ_nat_code, num_academie }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        console.log(uai_formation);
        console.log(code_postal);
        console.log(capacite);
        console.log(periode);
        console.log(educ_nat_code);
        console.log(num_academie);
        setEdition(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    async function run() {
      try {
        let form = null;
        if (!presetFormation) {
          form = await API.get("api", `/formation/${match.params.id}`);
          setFormation(form);
        } else {
          form = presetFormation;
        }

        setFieldValue("uai_formation", form.uai_formation);
        setFieldValue("code_postal", form.code_postal);
        setFieldValue("periode", form.periode);
        setFieldValue("capacite", form.capacite);
        setFieldValue("educ_nat_code", form.educ_nat_code);
        setFieldValue("num_academie", form.num_academie);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [match, setFieldValue, presetFormation]);

  const onEdit = () => {
    setEdition(!edition);
  };

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
          <Formation
            formation={formation}
            edition={edition}
            onEdit={onEdit}
            values={values}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
          />
        </Container>
      </div>
    </div>
  );
};
