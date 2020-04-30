import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
//import * as Sentry from "@sentry/browser";

import configureStore, { history } from "./redux";
import awsConfigure from "./services/aws";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

import "bootstrap/dist/css/bootstrap.min.css";

const store = configureStore();

window.saveHost = window.location.hostname;

async function init() {
  await awsConfigure();

  // Sentry.init({
  //   dsn: "https://SENKEY@sentry.io/KEY",
  //   environment: "ENVNAME",
  // });
  //Sentry.configureScope(scope => scope.setUser({ id: user._id }));

  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>,
    document.getElementById("root")
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
}

init();
