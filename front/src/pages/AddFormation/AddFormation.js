import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Input, FormGroup, Label, Form } from "reactstrap";
import { API } from "aws-amplify";
import { useFormik } from "formik";

import Formation from "../Formation";

import "./addFormation.css";

const Step2 = ({ etablissement, onComplete }) => {
  const [formation, setFormation] = useState(null);

  const { values, handleSubmit, handleChange, isSubmitting } = useFormik({
    initialValues: {
      educ_nat_code: "",
      code_postal: "",
      uai_formation: "",
    },
    onSubmit: ({ educ_nat_code, code_postal, uai_formation }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        try {
          let resp = await API.post("api", `/formation`, {
            body: {
              educ_nat_code,
              etablissement_responsable_siret: etablissement.siret,
              etablissement_formateur_siret: etablissement.siret,
              code_postal,
              uai_formation,
              draft: true,
            },
          });
          console.log(resp);
          await API.get("api", `/services?job=formation&id=${resp._id}`);
          resp = await API.get("api", `/formation/${resp._id}`);
          console.log(resp);
          onComplete(resp);
          // const params = new window.URLSearchParams({
          //   query: JSON.stringify({ siret }),
          // });
          // const resp = await API.get("api", `/etablissement?${params}`);
          // // console.log(resp);
          // setFormation(resp);
        } catch (e) {
          // const {
          //   response: { status },
          // } = e;
          // if (status === 404) {
          //   let resp = await API.post("api", `/etablissement`, {
          //     body: {
          //       siret,
          //     },
          //   });
          //   await API.get("api", `/services?job=etablissement&id=${resp._id}`);
          //   resp = await API.get("api", `/etablissement/${resp._id}`);
          //   // console.log(resp);
          //   if (!resp.api_entreprise_reference) {
          //     resp = await API.del("api", `/etablissement/${resp._id}`);
          //   } else {
          //     setFormation(resp);
          //   }
          // } else {
          console.log(e);
          //}
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
            <Form>
              <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="educ_nat_code" className="mr-sm-2 label-form">
                  <strong>Code diplôme Education Nationale</strong>
                </Label>
                <Input
                  type="text"
                  name="educ_nat_code"
                  onChange={handleChange}
                  value={values.educ_nat_code}
                  disabled={isSubmitting || formation}
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
                  disabled={isSubmitting || formation}
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
                  disabled={isSubmitting || formation}
                />
              </FormGroup>
              <Button color="primary" onClick={handleSubmit} disabled={!(!isSubmitting && !formation)}>
                Valider
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const Step1 = ({ onComplete }) => {
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
          console.log(resp);
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
            if (!resp.api_entreprise_reference) {
              resp = await API.del("api", `/etablissement/${resp._id}`);
            } else {
              setEtablissement(resp);
            }
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
                  <strong>Numéro de siret</strong>&nbsp;établissement
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
                <Button className="mt-2" color="danger" size="lg" style={{ marginRight: "3rem" }} onClick={onCancel}>
                  Choisir un autre établissement
                </Button>
                <Button className="mt-2" color="success" size="lg" onClick={() => onComplete(etablissement)}>
                  Sélectionner et aller à l'étape suivante >
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
  const [etablissement, setEtablissement] = useState(null);
  const [formation, setFormation] = useState(null);
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);

  const onStep1Complete = etablissement => {
    setStep1(false);
    setStep2(true);
    setEtablissement(etablissement);
  };

  const onStep2Complete = formation => {
    setStep2(false);
    setFormation(formation);
    setStep3(true);
  };

  return (
    <div className="page add-formation">
      <h2 className="mt-3">Référencer une offre de formation</h2>
      {step1 && <Step1 onComplete={onStep1Complete} />}
      {step2 && <Step2 etablissement={etablissement} onComplete={onStep2Complete} />}
      {step3 && formation && <Formation presetFormation={formation} />}
    </div>
  );
};
