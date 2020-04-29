import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { useFormik } from "formik";

import { forgotPassword } from "../../redux/Auth/actions";

import "./forgotPassword.css";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.user);

  const [info, setInfo] = useState(null);

  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      username: "",
    },
    onSubmit: ({ username }, { setSubmitting }) => {
      dispatch(forgotPassword(username));
      setInfo("Veuillez vérifier votre boîte de réception");
      setSubmitting(false);
    },
  });

  return (
    <div className="page forgotPassword">
      <h2 className="mt-3 mb-3">Mot de passe oublié</h2>
      <Form onSubmit={handleSubmit} className="mt-3">
        {error && <Alert color="danger">{error}</Alert>}
        {info && !error && <Alert color="success">{info}</Alert>}
        <FormGroup className="section">
          <Label for="username">Votre email</Label>
          <Input type="text" name="username" id="username" onChange={handleChange} value={values.username} />
        </FormGroup>
        <FormGroup className="section">
          <Button type="submit" color="secondary">
            Réinitialiser
          </Button>
        </FormGroup>
      </Form>
    </div>
  );
};

export default ForgotPassword;
