import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route, withRouter } from "react-router-dom";
import WebFont from "webfontloader";

import { getCurrentUser } from "./services/aws";
import { fetchUserSuccess, setUserAcm } from "./redux/Auth/actions";

import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import RestrictedRoute from "./components/RestrictedRoute";
import {
  Landing,
  NotFound,
  Establishments,
  Trainings,
  SignIn,
  Profile,
  ChangePassword,
  ForgotPassword,
  Stats,
  Journal,
  HowToModif,
  HowToReglement,
  Users,
  Duplicates,
  Formation,
  Search,
  AddFormation,
  Etablissement,
} from "./pages";

import routes from "./routes.json";

import "./App.css";
WebFont.load({
  google: { families: ["Josefin Sans: 200, 300, 400, 600, 700", "Nexa", "Raleway"] },
  custom: {
    families: ["Font Awesome 5 Icons:400,900", "Font Awesome 5 Brands:400"],
    urls: ["//use.fontawesome.com/releases/v5.0.8/css/all.css"],
  },
});

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    async function run() {
      let user = "Guest";
      try {
        user = await getCurrentUser();
        if (user) {
          dispatch(fetchUserSuccess(user));
          dispatch(setUserAcm(user));
        }
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [dispatch]);
  return (
    <Layout>
      <ScrollToTop />
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route exact path={routes.FORMATIONS} component={Trainings} />
        <Route exact path={routes.ESTABLISHMENTS} component={Establishments} />
        <Route exact path={routes.SIGNIN} component={SignIn} />
        <RestrictedRoute exact path={routes.PROFILE} component={Profile} />
        <RestrictedRoute exact path={routes.HOWTO_MODIF} component={HowToModif} />
        <RestrictedRoute exact path={routes.HOWTO_REGLEMENT} component={HowToReglement} />
        <RestrictedRoute exact path={routes.ADMIN_USERS} component={Users} />
        <RestrictedRoute exact path={routes.ADMIN_DUPLICATE} component={Duplicates} />
        <Route exact path={`/search/:base`} component={Search} />
        <Route exact path={`/formation/:id`} component={Formation} />
        <Route exact path={`/etablissement/:id`} component={Etablissement} />
        <Route exact path={routes.ADD_FORMATION} component={AddFormation} />
        <Route exact path={routes.CHANGEPASSWORD} component={ChangePassword} />
        <Route exact path={routes.FORGOTPASSWORD} component={ForgotPassword} />
        <Route exact path={routes.STATISTIQUES} component={Stats} />
        <Route exact path={routes.CHANGELOG} component={Journal} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
};

export default withRouter(App);
