# Traitements liés aux formations

#### Vérification des données Diplôme Niveau Intitulé

* vérifier que le code diplôme existe
* vérifier que le code diplôme est valide \(encore actif sur la période affichage offre de formation\)
* s'assurer que le niveau de formation est bien celui délivré par le diplôme/titre visé
* s'assurer que la nomenclature européenne des niveaux est affichée
* afficher l'intitulé diplôme selon les nomenclatures utilisées par l'Education Nationale et l'Enseignement Supérieur
* afficher des intitulés court, long normalisés
* mettre en place des traitements spécifiques pour les Mentions Complémentaires

#### Vérification des UAI

* s'assurer que le code UAI partie formation existe et correspond à un “numéro UAI site”
* identifier les UAI invalides afin de permettre une investigation/ correction des données en base \(BCE, Accé, ...\) 

#### Vérification du rattachement académique

* s'assurer que la formation est rattachée à son académie
* vérifier la cohérence entre le code académie et son libellé

#### Vérifications RNCP

* vérifier que le titre RNCP est habilité à être délivré en apprentissage, c’est-à-dire : qu’il est présent dans la fiche RNCP correspondante consultable via Répertoire national des certifications professionnelles \(RNCP\) \(hors Répertoire Spécifique\) en tant que diplôme ou titre enregistré “de droit” ou en tant que diplôme ou titre enregistré “sur demande” et pouvant être dispensé par apprentissage.
* vérifier le niveau de formation nomenclature européenne à partir du RNCP
* déterminer les différents code ROME accessibles pour chaque fiche RNCP
* distinguer dans le catalogue si la formation visée est un titre RNCP ou un Diplome EN 
* mettre à jour le Code RNCP si le code Diplome = Code RNCP
* vérifier la validité d'un Code RNCP 
* identifier les actions complémentaires à entreprendre s'il n'y a pas de correspondance Code RNCP - code Diplome
* établir une correspondance code MEF -Code RNCP pour identifier les formations délivrant strictement des RNCP

#### Permettre de rechercher une formation à partir d'une appellation du Rome, de son libellé ou du libellé du RNCP ou du Diplôme

* s'assurer de la capacité d'appel des formations à partir d'appellations du Rome
* pouvoir rechercher une formation dans le catalogue à partir du libellé du Rome ou du libellé du RNCP ou du Diplôme
* permettre la saisie approximative d’une appellation du Rome, de son libellé ou du libellé du RNCP ou du Diplôme

#### Conditions d'entrée d'une formation au sein des SI Affelnet et Parcoursup

Besoins :   
- quand, je consulte le catalogue des offres de formation en Apprentissage  
- je veux, être assuré que la formation est “légitime” au sein de Parcoursup ou Affelnet afin de garantir la conformité de la formation et d’éviter des contrôles manuels chronophages

Cette spécification répond au besoin de chargement des formations en apprentissage pour les besoins de Parcoursup ou Affelnet afin d’améliorer le nombre de formations proposées en apprentissage au sein des choix de formations offertes par les SI de l'Education Nationale et de l'Enseignement Supérieur.

Note DGESIP du 18 février 2020

Note DGESCO du 13 janvier 2020

#### Table de correspondance Code MEF - Code diplôme formation

identifier les formations présentes dans les SI EN et qui sont également référencées dans le catalogue afin de concentrer les efforts de saisie sur les nouvelles formations à faire entrer dans les SI EN \(Parcoursup et Affelnet\)  
dédoublonner des formations au sein du catalogue apprentissage \(car le seul code diplôme ne permet pas de réaliser ce dédoublonnage\).

#### Intégration de données complémentaires

* ONISEP \(descriptif formation\)
* Coordonnées GPS \(API BAN\)



