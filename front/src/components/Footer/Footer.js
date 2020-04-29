import React from "react";
import { Link } from "react-router-dom";

import routes from "../../routes.json";

import "./footer.css";

const Footer = () => {
  return (
    <footer className="footerNav">
      <section className="name ml-3">Mission apprentissage.</section>
      <section className="sitemap">
        <div>
          <h5>Catalogue</h5>
          <Link to={routes.FORMATIONS}>Liste des formations</Link>
          <Link to={routes.ESTABLISHMENTS}>Liste des établissements</Link>
        </div>
        <div>
          <h5>Support</h5>
          <a href="mailto:anne.becquet@beta.gouv.fr">anne.becquet@beta.gouv.fr</a>
        </div>
      </section>
      <section className="copyright">Copyright © 2020</section>
    </footer>
  );
};

export default Footer;
