import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import routes from "../../routes.json";

const RestrictedRoute = ({ component: Component, ...rest }) => {
  const { user } = useSelector((state) => state.user);
  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: routes.SIGNIN,
              state: { referrer: rest.location },
            }}
          />
        )
      }
    />
  );
};

export default RestrictedRoute;
