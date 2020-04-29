import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

import { changePassword } from "../../redux/Auth/actions";

import "./changePassword.css";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Email non valide").required("requis"),
  newpassword: Yup.string()
    .min(8, "min")
    .matches(/[a-z]/, "lowerCase")
    .matches(/[A-Z]/, "upperCase")
    .matches(/[0-9]/, "number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "special")
    .required("requis"),
});

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { user, router } = useSelector((state) => state);
  const { query } = router.location;

  const [conditions, setConditions] = useState({
    min: false,
    lowerCase: false,
    upperCase: false,
    number: false,
    special: false,
  });

  const { values, errors, touched, handleSubmit, handleChange } = useFormik({
    initialValues: {
      email: query.email || "",
      code: query.code || "",
      newpassword: "",
    },
    validationSchema,
    onSubmit: ({ email, newpassword, code }, { setSubmitting }) => {
      dispatch(changePassword({ user: user.user, email, newPassword: newpassword, code }));
      setSubmitting(false);
    },
  });

  const onChange = async (e) => {
    handleChange(e);
    const val = e.target.value;
    const min = Yup.string().min(8, "min");
    const lowerCase = Yup.string().matches(/[a-z]/, "lowerCase");
    const upperCase = Yup.string().matches(/[A-Z]/, "upperCase");
    const number = Yup.string().matches(/[0-9]/, "number");
    const special = Yup.string().matches(/[!@#$%^&*(),.?":{}|<>]/, "special");
    setConditions({
      min: await min.isValid(val),
      lowerCase: await lowerCase.isValid(val),
      upperCase: await upperCase.isValid(val),
      number: await number.isValid(val),
      special: await special.isValid(val),
    });
  };

  return (
    <div className="page changePassword">
      <div className="mt-4">Changer de mot de passe</div>
      {user.error && <Alert color="danger">{user.error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <FormGroup className="mt-4">
          <Label for="email">Votre email</Label>
          <Input
            type="text"
            name="email"
            id="email"
            onChange={handleChange}
            value={values.email}
            disabled={!!query.email}
          />
          {errors.email && touched.email && errors.email}
        </FormGroup>
        {query.forgot && (
          <FormGroup className="mt-4">
            <Label for="code">Code de confirmation</Label>
            <Input
              type="text"
              name="code"
              id="code"
              onChange={handleChange}
              value={values.code}
              disabled={!!query.code}
            />
            {errors.code && touched.code && errors.code}
          </FormGroup>
        )}
        <FormGroup>
          <Label for="newpassword">Nouveau mot de passe</Label>
          <Input type="password" name="newpassword" id="newpassword" onChange={onChange} value={values.newpassword} />
          <p className="mdp-rules">
            <li className={!conditions.lowerCase ? "error" : "success"}>
              {!conditions.min ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins une lettre minuscule
            </li>
            <li className={!conditions.upperCase ? "error" : "success"}>
              {!conditions.lowerCase ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins une lettre majuscule
            </li>
            <li className={!conditions.special ? "error" : "success"}>
              {!conditions.upperCase ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins un caractère spécial
            </li>
            <li className={!conditions.number ? "error" : "success"}>
              {!conditions.number ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins un nombre
            </li>
            <li className={!conditions.min ? "error" : "success"}>
              {!conditions.special ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins 8 caractères
            </li>
          </p>
        </FormGroup>
        <Button type="submit" color="primary" className="mt-2">
          Changer votre mot de passe
        </Button>
      </Form>
    </div>
  );
};

export default ChangePassword;
