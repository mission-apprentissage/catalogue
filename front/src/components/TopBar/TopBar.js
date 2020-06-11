import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavbarText,
  Button,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { push } from "connected-react-router";

import { signOut } from "../../redux/Auth/actions";
import routes from "../../routes.json";
import { getEnvName } from "../../config";

import "./topbar.css";
import logo from "./logo.png";

const ENV_NAME = getEnvName();

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector(state => state.user);
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
              <Link to={`/`} className={"nav-link link"}>
                Accueil
              </Link>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Recherche
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  <Link to={routes.SEARCH_FORMATIONS} className={"nav-link link"}>
                    Formations
                  </Link>
                </DropdownItem>
                <DropdownItem>
                  <Link to={routes.SEARCH_ETABLISSEMENTS} className={"nav-link link"}>
                    Établissements
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            {user && (
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Guides
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    <Link to={routes.HOWTO_MODIF} className={"nav-link link"}>
                      Guide d'utilisation
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link to={routes.HOWTO_REGLEMENT} className={"nav-link link"}>
                      Guide réglementaire
                    </Link>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )}
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
