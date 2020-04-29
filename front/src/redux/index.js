import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";

import rootReducer from "./rootReducer";

export const history = createBrowserHistory();

const initialState = {};
const enhancers = [];

const middleware = [routerMiddleware(history), thunk];

if (process.env.NODE_ENV === "development") {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === "function") {
    enhancers.push(devToolsExtension());
  }
}

const createStoreWithMiddleware = compose(applyMiddleware(...middleware), ...enhancers)(createStore);

export default function configureStore(preloadState = initialState) {
  const store = createStoreWithMiddleware(rootReducer(history), preloadState);
  return store;
}
