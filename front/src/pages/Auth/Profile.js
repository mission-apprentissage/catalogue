import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "reactstrap";
import { push } from "connected-react-router";

import { signOut } from "../../redux/Auth/actions";

import routes from "../../routes.json";

import "./profile.css";

const Profile = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();

  return (
    <div className="page profile">
      <h2 className="mt-3 mb-3">Détails de votre compte</h2>
      <div className="mt-3 mb-3">Nom d'utilisateur: {user.username}</div>
      <div className="mt-3 mb-3">Email: {user.attributes.email}</div>
      <div className="mt-3 mb-3">
        Droits de modifications sur l'académie:{" "}
        {user.attributes["custom:access_all"] ? "toutes" : user.attributes["custom:access_academie"]}
      </div>
      <div className="mt-3 mb-3">
        Api Key:
        {user.attributes["custom:apiKey"]}
      </div>
      <div className="profile-btn mt-3 mb-3">
        <Button color="primary" onClick={() => dispatch(push(routes.FORGOTPASSWORD))}>
          Changer votre mot de passe
        </Button>
        {user.attributes["custom:access_all"] && (
          <Button color="primary" onClick={() => dispatch(push(routes.ADMIN))}>
            Admin
          </Button>
        )}
        <Button color="secondary" onClick={() => dispatch(signOut())}>
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default Profile;
