import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavbarText, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { push } from "connected-react-router";

import { signOut } from "../../redux/Auth/actions";
import routes from "../../routes.json";
import { getEnvName } from "@config";

import "./topbar.css";
import logo from "./logo.png";

const ENV_NAME = getEnvName();

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const toggle = () => setIsOpen(!isOpen);

  return (
    <header className="header">
      <Navbar light expand="md" fixed="top" className="navBar">
        <NavbarBrand href="/">
          <img src={logo} alt="Logo" className="logo md" />
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <Link to={routes.FORMATIONS} className={"nav-link link"}>
                Formations
              </Link>
            </NavItem>
            <NavItem>
              <Link to={routes.ESTABLISHMENTS} className={"nav-link link"}>
                Établissements
              </Link>
            </NavItem>
          </Nav>
          <NavbarText>{ENV_NAME === "local" || ENV_NAME === "dev" ? "(env: dev)" : ""}</NavbarText>
          <NavbarText>
            {user ? (
              <div className="user-logged-in">
                <FontAwesomeIcon
                  className="profil-icon"
                  icon={faUser}
                  size="sm"
                  onClick={() => dispatch(push(routes.PROFILE))}
                />
                <Button color="secondary" onClick={() => dispatch(signOut())}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Link to={routes.SIGNIN} className={"nav-link link"}>
                S'identifier
              </Link>
            )}
          </NavbarText>
        </Collapse>
      </Navbar>
    </header>
  );
};

export default TopBar;
