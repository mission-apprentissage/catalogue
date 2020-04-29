import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import Auth from "./Auth/reducer";

const appState = {
  user: Auth,
};

export default (history) =>
  combineReducers({
    router: connectRouter(history),
    ...appState,
  });
