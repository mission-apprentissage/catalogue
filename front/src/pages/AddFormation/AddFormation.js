import React, { useState } from "react";
import { Container, Row, Col, Button, Spinner, Input, FormGroup, Label, Form, Alert } from "reactstrap";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import Formation from "../Formation";

import "./addFormation.css";

const sleep = m => new Promise(r => setTimeout(r, m));

const checkIfHasRightToEdit = (num_academie, userAcm) => {
  let hasRightToEdit = userAcm.all;
  if (!hasRightToEdit) {
    hasRightToEdit = userAcm.academie.includes(`${num_academie}`);
  }
  return hasRightToEdit;
};

const Step2 = ({ etablissementF, etablissementR, onComplete }) => {
  const [gatherData, setGatherData] = useState(0);
  const { acm: userAcm } = useSelector(state => state.user);
  const [noRights, setNoRights] = useState(false);

  const { values, handleSubmit, handleChange, isSubmitting } = useFormik({
    initialValues: {
      educ_nat_code: "",
      code_postal: "",
      uai_formation: "",
      num_academie: 0,
    },
    onSubmit: ({ educ_nat_code, code_postal, uai_formation, num_academie }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        try {
          const hasRightToEdit = checkIfHasRightToEdit(num_academie, userAcm);
          if (hasRightToEdit) {
            setNoRights(false);
            setGatherData(1);
            let formation = await API.post("api", `/formation`, {
              body: {
                educ_nat_code,
                etablissement_responsable_siret: etablissementR.siret,
                etablissement_formateur_siret: etablissementF.siret,
                code_postal,
                num_academie,
                uai_formation,
                draft: true,
              },
            });
            setGatherData(2);
            //console.log(formation);
            await API.get("api", `/services?job=formation-update&id=${formation._id}`);
            setGatherData(3);
            await API.get("api", `/services?job=rncp&id=${formation._id}`);
            setGatherData(4);
            await API.get("api", `/services?job=onisep&id=${formation._id}`);
            setGatherData(5);
            formation = await API.get("api", `/formation/${formation._id}`);
            //console.log(formation);
            await API.del("api", `/formation/${formation._id}`);
            setGatherData(6);
            await sleep(500);
            onComplete(formation);
          } else {
            setNoRights(true);
          }
        } catch (e) {
          console.log(e);
        }
        resolve("onSubmitHandler complete");
        setSubmitting(false);
      });
    },
  });
  return (
    <div className="notice mt-5">
      <Container>
        <Row>
          <Col>
            {noRights && (
              <Alert color="danger" style={{ fontSize: "1rem", fontWeight: "bolder" }}>
                Vous ne pouvez pas ajouter une formation hors de votre académie
              </Alert>
            )}
            {!isSubmitting && (
              <Form style={{ width: "50%" }}>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                  <Label for="educ_nat_code" className="mr-sm-2 label-form">
                    <strong>Code diplôme Education Nationale</strong>
                  </Label>
                  <Input
                    type="text"
                    name="educ_nat_code"
                    onChange={handleChange}
                    value={values.educ_nat_code}
                    disabled={isSubmitting}
                  />
                </FormGroup>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                  <Label for="uai_formation" className="mr-sm-2 label-form">
                    <strong>Code UAI de la formation</strong>
                  </Label>
                  <Input
                    type="text"
                    name="uai_formation"
                    onChange={handleChange}
                    value={values.uai_formation}
                    disabled={isSubmitting}
                  />
                </FormGroup>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                  <Label for="code_postal" className="mr-sm-2 label-form">
                    <strong>Code postal</strong>
                  </Label>
                  <Input
                    type="text"
                    name="code_postal"
                    onChange={handleChange}
                    value={values.code_postal}
                    disabled={isSubmitting}
                  />
                </FormGroup>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                  <Label for="num_academie" className="mr-sm-2 label-form">
                    <strong>Numéro d'académie</strong>
                  </Label>
                  <Input
                    type="text"
                    name="num_academie"
                    onChange={handleChange}
                    value={values.num_academie}
                    disabled={isSubmitting}
                  />
                </FormGroup>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="submit-formation-attr"
                  style={{ width: "99%" }}
                >
                  Valider
                </Button>
              </Form>
            )}
            {gatherData !== 0 && (
              <div>
                <div>
                  Ajout de la fornation {gatherData === 1 && <Spinner color="secondary" />}
                  {gatherData > 1 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                </div>
                <div>
                  Recherche des informations générale {gatherData === 2 && <Spinner color="secondary" />}
                  {gatherData > 2 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                </div>
                <div>
                  Recherche des informations RNCP{" "}
                  {gatherData === 3 && (
                    <>
                      <Spinner color="secondary" />
                      <span style={{ fontSize: "1rem" }}>Cette étape peut prendre du temps</span>
                    </>
                  )}
                  {gatherData > 3 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                </div>
                <div>
                  Recherche des informations Onisep {gatherData === 4 && <Spinner color="secondary" />}
                  {gatherData > 4 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                </div>
                <div>
                  Vérification {gatherData === 5 && <Spinner color="secondary" />}
                  {gatherData > 5 && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const Step1 = ({ onComplete, title }) => {
  const [etablissement, setEtablissement] = useState(null);

  const { values, handleSubmit, handleChange, isSubmitting } = useFormik({
    initialValues: {
      siret: "",
    },
    onSubmit: ({ siret }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        try {
          const params = new window.URLSearchParams({
            query: JSON.stringify({ siret }),
          });
          const resp = await API.get("api", `/etablissement?${params}`);
          //console.log(resp);
          setEtablissement(resp);
        } catch (e) {
          const {
            response: { status },
          } = e;
          if (status === 404) {
            let resp = await API.post("api", `/etablissement`, {
              body: {
                siret,
              },
            });
            await API.get("api", `/services?job=etablissement&id=${resp._id}`);
            resp = await API.get("api", `/etablissement/${resp._id}`);
            // console.log(resp);
            setEtablissement(resp);
            await API.del("api", `/etablissement/${resp._id}`);
            // if (!resp.api_entreprise_reference) {
            //   resp = await API.del("api", `/etablissement/${resp._id}`);
            // } else {
            //   setEtablissement(resp);
            // }
          } else {
            console.log(e);
          }
        }
        resolve("onSubmitHandler complete");
        setSubmitting(false);
      });
    },
  });

  const onCancel = () => {
    setEtablissement(null);
  };

  return (
    <div className="notice mt-5">
      <Container>
        <Row>
          <Col>
            <Form inline>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="siret" className="mr-sm-2 label-form">
                  <strong>Numéro de siret</strong>&nbsp;établissement {title}
                </Label>
                <Input
                  type="text"
                  name="siret"
                  onChange={handleChange}
                  value={values.siret}
                  disabled={isSubmitting || etablissement}
                />
              </FormGroup>
              <Button color="primary" onClick={handleSubmit} disabled={!(!isSubmitting && !etablissement)}>
                Recherche
              </Button>
            </Form>

            {isSubmitting && <Spinner color="secondary" />}
          </Col>
        </Row>
        {etablissement && (
          <Row className="mt-3 mb-3">
            <Col md="12">
              <div className="notice-details">
                <h2 className="small">Établissement</h2>
                <div className="field multiple">
                  <div>
                    <h3>Raison sociale</h3>
                    <p>{etablissement.entreprise_raison_sociale}</p>
                  </div>
                  <div>
                    <h3>Type</h3>
                    <p>{etablissement.computed_type}</p>
                  </div>
                </div>
                <div className="field multiple">
                  <div>
                    <h3>Siret</h3>
                    <p>{etablissement.siret}</p>
                  </div>
                  <div>
                    <h3>UAI</h3>
                    <p>{etablissement.uai}</p>
                  </div>
                </div>
                <div className="field multiple">
                  <div>
                    <h3>Adresse</h3>
                    <p>{etablissement.adresse}</p>
                  </div>
                  <div>
                    <h3>Académie</h3>
                    <p>
                      {etablissement.nom_academie} ({etablissement.num_academie})
                    </p>
                  </div>
                </div>
                <div className="field">
                  <h3>Établissement conventionné ?</h3>
                  <p>{etablissement.computed_conventionne}</p>
                </div>
                <div className="field">
                  <h3>Établissement déclaré en préfecture ?</h3>
                  <p>{etablissement.computed_declare_prefecture}</p>
                </div>
                <div className="field">
                  <h3>Organisme certifié 2015 - datadock ?</h3>
                  <p>{etablissement.computed_info_datadock}</p>
                </div>
                <div className="field">
                  <h3>Contact</h3>
                  <p>{etablissement.ds_questions_email}</p>
                </div>
              </div>
              <div>
                <Button className="mt-2" color="danger" style={{ marginRight: "3rem" }} onClick={onCancel}>
                  Choisir un autre établissement
                </Button>
                <Button className="mt-2" color="success" onClick={() => onComplete(etablissement)}>
                  Sélectionner
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default () => {
  const [etablissementF, setEtablissementF] = useState(null);
  const [etablissementR, setEtablissementR] = useState(null);
  const [formation, setFormation] = useState(null);
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [step4, setStep4] = useState(false);

  const onStep1Complete = etablissementF => {
    setStep1(false);
    setStep2(true);
    setEtablissementF(etablissementF);
  };

  const onStep2Complete = etablissementR => {
    setStep2(false);
    setStep3(true);
    setEtablissementR(etablissementR);
  };

  const onStep3Complete = formation => {
    setStep3(false);
    setFormation(formation);
    setStep4(true);
  };

  return (
    <div className="page add-formation">
      <h2 className="mt-5">Référencer une offre de formation</h2>
      {step1 && <Step1 onComplete={onStep1Complete} title="Formateur" />}
      {step2 && <Step1 onComplete={onStep2Complete} title="Responsable" />}
      {step3 && <Step2 etablissementF={etablissementF} etablissementR={etablissementR} onComplete={onStep3Complete} />}
      {step4 && formation && <Formation presetFormation={formation} />}
    </div>
  );
};
