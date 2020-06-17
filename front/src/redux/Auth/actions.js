import { Auth } from "aws-amplify";
import { push } from "connected-react-router";
import routes from "../../routes.json";

export const types = {
  FETCH_USER_REQUEST: "auth/FETCH_USER_REQUEST",
  FETCH_USER_SUCCESS: "auth/FETCH_USER_SUCCESS",
  FETCH_USER_FAILURE: "auth/FETCH_USER_FAILURE",
  SIGN_OUT: "auth/SIGN_OUT",
  CHANGE_PASSWORD: "auth/CHANGE_PASSWORD",
  SET_ACM: "auth/SET_ACM",
  INFO: "auth/INFO",
};

export const fetchUserRequest = () => ({
  type: types.FETCH_USER_REQUEST,
});

export const fetchUserSuccess = user => ({
  type: types.FETCH_USER_SUCCESS,
  user,
});

export const fetchUserFailure = error => ({
  type: types.FETCH_USER_FAILURE,
  error,
});

export const informUser = info => ({
  type: types.INFO,
  info,
});

export const signOutUserSuccess = () => ({
  type: types.FETCH_USER_SUCCESS,
});

export const changeUserPassword = user => ({
  type: types.CHANGE_PASSWORD,
  user,
});

export const setUserAcm = (user = null) => {
  if (!user) {
    return {
      type: types.SET_ACM,
      acm: {
        all: false,
        academie: [],
        apiKey: "",
      },
    };
  }

  const access_all = user.attributes["custom:access_all"] || false;
  const access_academie = user.attributes["custom:access_academie"].split(",") || [];
  const apiKey = user.attributes["custom:apiKey"] || "";

  return {
    type: types.SET_ACM,
    acm: {
      all: access_all,
      academie: access_academie,
      apiKey: apiKey,
    },
  };
};

/** ASYNC ACTIONS **/

export const signIn = ({ username, password }) => {
  return async dispatch => {
    dispatch(fetchUserRequest());

    try {
      const user = await Auth.signIn(username, password);
      if (user.challengeName === "SMS_MFA" || user.challengeName === "SOFTWARE_TOKEN_MFA") {
        /*// You need to get the code from the UI inputs
        // and then trigger the following function with a button click
        const code = getCodeFromUserInput();
        // If MFA is enabled, sign-in should be confirmed with the confirmation code
        const loggedUser = await Auth.confirmSignIn(
          user, // Return object from Auth.signIn()
          code, // Confirmation code
          mfaType // MFA Type e.g. SMS_MFA, SOFTWARE_TOKEN_MFA
        );*/
      } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
        dispatch(changeUserPassword(user));
      } else if (user.challengeName === "MFA_SETUP") {
        // This happens when the MFA method is TOTP
        // The user needs to setup the TOTP before using it
        // More info please check the Enabling MFA part
        Auth.setupTOTP(user);
      } else {
        // The user directly signs in
        dispatch(fetchUserSuccess(user));
        dispatch(setUserAcm(user));
      }
    } catch (err) {
      if (err.code === "UserNotConfirmedException") {
        // The error happens if the user didn't finish the confirmation step when signing up
        // In this case you need to resend the code and confirm the user
        // About how to resend the code and confirm the user, please check the signUp part
      } else if (err.code === "PasswordResetRequiredException") {
        // The error happens when the password is reset in the Cognito console
        // In this case you need to call forgotPassword to reset the password
        // Please check the Forgot Password part.
      } else if (err.code === "NotAuthorizedException") {
        // The error happens when the incorrect password is provided
        if (err.message === "Temporary password has expired and must be reset by an administrator.") {
          dispatch(
            fetchUserFailure("Votre mot de passe temporaire a expiré et doit être réinitialisé par un administrateur.")
          );
        } else {
          dispatch(fetchUserFailure("Identifiant ou mot de passe incorrect."));
        }
      } else if (err.code === "UserNotFoundException") {
        // The error happens when the supplied username/email does not exist in the Cognito user pool
        dispatch(fetchUserFailure("Identifiant ou mot de passe incorrect."));
      } else if (err.message === "User password cannot be reset in the current state.") {
        dispatch(
          fetchUserFailure(
            "Votre compte n'a pas été activé, merci d'utiliser de votre mot de passe temporaire ou contacter un administrateur."
          )
        );
      } else {
        console.error(err);
        dispatch(fetchUserFailure(err.message || "Unexpected error"));
      }
    }
  };
};

export const signOut = () => {
  return async dispatch => {
    dispatch(fetchUserRequest());
    try {
      await Auth.signOut();
      dispatch(signOutUserSuccess());
      dispatch(setUserAcm());
    } catch (e) {
      dispatch(fetchUserFailure(e.message || "Unexpected error"));
    }
  };
};

export const forgotPassword = user => {
  return async dispatch => {
    try {
      await Auth.forgotPassword(user);
    } catch (e) {
      if (e.code === "UserNotFoundException") {
        dispatch(fetchUserFailure("Utilisateur introuvable."));
      } else if (e.code === "LimitExceededException") {
        dispatch(fetchUserFailure("Limite de tentatives dépassée, veuillez essayer après un certain temps."));
      } else {
        dispatch(fetchUserFailure(e.message || "Unexpected error"));
      }
    }
  };
};

export const changePassword = ({ user, email, newPassword, code }) => {
  return async dispatch => {
    try {
      if (!user && code !== "") {
        await Auth.forgotPasswordSubmit(email, code, newPassword);
        dispatch(
          informUser(
            "La modification de votre mot de passe a bien été enregistré, vous pouvez désormais vous connecter"
          )
        );
        return dispatch(push(routes.SIGNIN));
      }
      const loggedUser = await Auth.completeNewPassword(
        user, // the Cognito User Object
        newPassword, // the new password
        {
          email,
        }
      );
      dispatch(fetchUserSuccess(loggedUser));
      dispatch(push("/"));
    } catch (e) {
      if (e.code === "LimitExceededException") {
        dispatch(fetchUserFailure("Limite de tentatives dépassée, veuillez essayer après un certain temps."));
      } else if (e.code === "ExpiredCodeException") {
        dispatch(fetchUserFailure("Code invalide fourni, veuillez demander à nouveau un code"));
      } else {
        dispatch(fetchUserFailure(e.message || "Unexpected error"));
      }
    }
  };
};
