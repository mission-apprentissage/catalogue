import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { useFormik } from "formik";

import { push } from "connected-react-router";

import { signIn } from "../../redux/Auth/actions";

import routes from "../../routes.json";

import "./signIn.css";

const SignIn = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error, info } = useSelector(state => state.user);
  const { location } = useSelector(state => state.router);

  useEffect(() => {
    async function run() {
      try {
        if (user && user.challengeName === "NEW_PASSWORD_REQUIRED") {
          dispatch(push(routes.CHANGEPASSWORD));
        } else if (user) {
          if (location.state && location.state.referrer) {
            dispatch(push(`${location.state.referrer.pathname}${location.state.referrer.search}`));
          } else {
            dispatch(push("/"));
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [dispatch, location.state, user]);

  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: ({ username, password }, { setSubmitting }) => {
      dispatch(signIn({ username, password }));
      setSubmitting(false);
    },
  });

  if (isLoading) {
    return <div className="page signIn">Chargement...</div>;
  }

  return (
    <div className="page signIn">
      <Form onSubmit={handleSubmit} className="mt-5">
        {error && <Alert color="danger">{error}</Alert>}
        {info && <Alert color="success">{info}</Alert>}
        <FormGroup className="section">
          <Label for="username">Identifiant</Label>
          <Input type="text" name="username" id="username" onChange={handleChange} value={values.username} />
        </FormGroup>
        <FormGroup className="section">
          <Label for="password">Mot de passe</Label>
          <Input type="password" name="password" id="password" onChange={handleChange} value={values.password} />
          <Link to={routes.FORGOTPASSWORD} className={"nav-link link forgot"}>
            Mot de passe oublié ?
          </Link>
        </FormGroup>
        <FormGroup className="section">
          <Button type="submit" color="secondary">
            Se connecter
          </Button>
        </FormGroup>
      </Form>
    </div>
  );
};

export default SignIn;
