const changelog = {
  list: [
    {
      version: "1.4",
      date: "Prochainement",
      about: `<h5>Les actions à venir :</h5>
      <ul>
        <li>La prise en compte des habilitations RNCP : vérification que la formation peut être délivrée en apprentissage et que l’organisme de formation est bien habilité par le certificateur à délivrer cette certification</li>
        <li>l'affichage du code MEF et de l'indication de la formation est présente sur Parcoursup et / ou Affelnet</li>
        <li>travail sur l’ergonomie de la base : affichage des champs, modalités de recherche et navigation, informations contenues dans certains champs.</li>
      </ul>`,
      fixes: [],
      features: [],
      improvements: [],
    },
    {
      version: "1.3",
      date: "24 Avril 2020",
      about: `<h5>A propos de cette version :</h5>
      Cette version porte des améliorations et quelques correctifs qui sont détaillés ci après.`,
      fixes: [
        "[Catalogue] Correction des niveaux de diplômes erronés pour les Mentions Complémentaires",
        "[Catalogue] Correction des niveaux de diplômes erronés sur 9 caractères contenant le code spécialité",
        "[Page] Correction des problèmes de connexions (modification du mot de passe, mot de passe oublié, caractéristiques obligatoires du mot de passe)",
        "[Catalogue] Ajout UAI 0541516E et des 13 formations manquantes au sein du catalogue",
        "[Page] Correction du problème de connexion lors d'une saisie de mauvais mot de passe",
        "[Page] Autorisation de modification uniquement sur les contenus non générés et non valident",
      ],
      features: ["[Page] Ajout mot de passe oublié"],
      improvements: [
        "[Catalogue] Descriptif détaillé sur les champs longs",
        "[Catalogue] Nettoyage des données UAI sur base des données de la DEPP",
        "[Catalogue] Ajout d'un filtre multi-critères sur les niveaux de formation",
        //'[Catalogue] Ajout d\'une catégorie (Vides) dans l\'onglet formation sur les champs "Uai Responsable" et sur "Uai formateur" et dans l\'onglet établissements sur le champ "Uai"',
      ],
    },
    {
      version: "1.2",
      date: "1er Avril 2020",
      about: `<h5>A propos de cette version :</h5>
      <ul>
        <li>
          l’harmonisation de certaines informations :
          <ul>
            <li>code diplôme/formation (seuls les diplômes en cours de validité seront affichés)</li>
            <li>niveau de formation (la nouvelle nomenclature européenne sera utilisée)</li>
            <li>
              intitulés (tous les intitulés diplôme, formation, seront normalisés sur la base des informations de
              la BCN)
            </li>
          </ul>
        </li>
      </ul>`,
      fixes: [
        "[page] Réparation du filtre des formations non éligible",
        "[page] Réparation du filtre conventionnement établissement",
        "[Catalogue] Ajout des formations académiques manquantes",
        "[Catalogue] Nettoyage des code uai des établissements",
        "[Catalogue] Nettoyage des codes postaux formations",
      ],
      features: ["[page] Ajout du journal des modifications"],
      improvements: ["[page] page d'accueil"],
    },
    {
      version: "1.1",
      date: "20 Mars 2020",
      about: `<h5>A propos de cette version :</h5>
      <ul>
        <li>les données sont compilées et à jour du 20/03/2020,</li>
        <li>
          l’onglet établissement a été modifié afin d’identifier les informations de conventionnement et de
          déclaration en préfecture,
        </li>
        <li>
          les vérifications sur l'éligibilité d'un établissement ont été automatisées :
          <ul>
            <li>s’agit -il d’un CFA conventionné ? </li>
            <li>l’organisme est-il déclaré en préfecture ? </li>
            <li>est ce qu’il porte la certification 2015 (datadock) ? </li>
          </ul>
        </li>
        <li>les données sont normalisées et conformes à ce qui existe sous Infogreffe, </li>
        <li>
          nous avons corrigé une fonctionnalité qui empêchait certains fichiers chargés sous Démarches Simplifiées
          d’être visibles au sein du catalogue.
        </li>
      </ul>`,
      fixes: ["Changement de l'ordre des resultats page formations"],
      features: ["Ajout de compte utilisateur", "Edition des formation disponible pour les utilisateurs"],
      improvements: ["Ajout de filtres sur les pages formations et établissement"],
    },
    {
      version: "1.0",
      date: "13 Mars 2020",
      about: `<h5>A propos de cette version :</h5>
      <ul>
        <li>Mise en ligne</li>
      </ul>`,
      fixes: [],
      features: ["Ajout de la page formations", "Ajout de la page établissement"],
      improvements: [],
    },
  ],
};

export default changelog;
