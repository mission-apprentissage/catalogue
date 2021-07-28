# Traitements liés aux formations

## Vue d’ensemble

![](../../.gitbook/assets/f.png)

## Détails des traitements

![](../../.gitbook/assets/f1.png)

### Vérifications et enrichissements via le CFD

_**Vérification des données Diplôme Niveau Intitulé**_

![](../../.gitbook/assets/cfd.png)

* Vérifier que le code diplôme existe dans l'une des tables BCN \(Base Centrale des Nomenclatures\) [N\_FORMATION\_DIPLOME](http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_FORMATION_DIPLOME) ou [V\_FORMATION\_DIPLOME](http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/V_FORMATION_DIPLOME)
* Vérifier que le code diplôme est valide : 
  * Recherche de code diplôme plus récent et Remplacer le cas échéant.
  * Encore actif sur la période affichage offre de formation - _**31 Août de l’année courante.**_
* S'assurer que le niveau de formation est bien celui délivré par le diplôme/titre visé
* S'assurer que la nomenclature européenne des niveaux est affichée
* Récupérer les intitulés court et long normalisés du diplôme selon les nomenclatures utilisées par l'Education Nationale et l'Enseignement Supérieur
* Recherche et récupération des codes MEFs 10 associés dans la table BCN [N\_MEF](https://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_MEF)
* Ajout des informations Onisep lié à ce code diplôme. [Détails Onisep plus bas dans cette page.](https://mission-apprentissage.gitbook.io/catalogue/traitements-scripts/traitements-lies-aux-formations#onisep-descriptif-formation) 
* Ajout des informations RNCP lié à ce code diplôme.  [Détails RNCP plus bas dans cette page.](https://mission-apprentissage.gitbook.io/catalogue/traitements-scripts/traitements-lies-aux-formations#verifications-rncp) 

### Vérification du rattachement académique

* s'assurer que la formation est rattachée à son académie
* vérifier la cohérence entre le code académie et son libellé

### Vérification des UAI

* s'assurer que le code UAI partie formation existe et correspond à un “numéro UAI site”
* identifier les UAI invalides afin de permettre une investigation/ correction des données en base \(BCE, Accé, ...\)

### Vérifications RNCP

![](../../.gitbook/assets/rncpformation.png)

[Voir le détails d'une fiche RNCP](../../tables-de-correspondances/documentation/rncp.md)

* vérifier que le titre RNCP est habilité à être délivré en apprentissage, c’est-à-dire : qu’il est présent dans la fiche RNCP correspondante consultable via Répertoire national des certifications professionnelles \(RNCP\) \(hors Répertoire Spécifique\) en tant que diplôme ou titre enregistré “de droit” ou en tant que diplôme ou titre enregistré “sur demande” et pouvant être dispensé par apprentissage.
* vérifier le niveau de formation nomenclature européenne à partir du RNCP
* déterminer les différents code ROME accessibles pour chaque fiche RNCP
* distinguer dans le catalogue si la formation visée est un titre RNCP ou un Diplome EN 
* mettre à jour le Code RNCP si le code Diplome = Code RNCP
* vérifier la validité d'un Code RNCP 
* identifier les actions complémentaires à entreprendre s'il n'y a pas de correspondance Code RNCP - code Diplome

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

{% page-ref page="publication-sur-affelnet.md" %}

{% page-ref page="publication-sur-parcoursup.md" %}

#### Table de correspondance Code MEF - Code formation diplôme

Identifier les formations présentes dans les SI EN et qui sont également référencées dans le catalogue afin de concentrer les efforts de saisie sur les nouvelles formations à faire entrer dans les SI EN \(Parcoursup et Affelnet\).  
Dédoublonner des formations au sein du catalogue apprentissage \(car le seul code diplôme ne permet pas de réaliser ce dédoublonnage\).

Récupération de la liste des codes MEF existants pour un code formation diplôme.  
Puis pour l'intégration dans le SI Affelnet déduction du code MEF éligible, en appliquant les règles de publication.

{% hint style="info" %}
Cette déduction du MEF éligible Affelnet est temporaire et sera retirée lorsque les modalités seront remontées dans la collecte RCO.
{% endhint %}

\*\*\*\*

**Vérification et enrichissement de l'adresse du lieu de formation**

Les informations de géolocalisation \(longitude / latitude\) sont collectées par RCO, les traitements suivants sont appliqués :

* Récupération des données adresse \(normalisation du numéro voie, type de voie, nom voie, code postal, localité\) en utilisant l'api de géocodage inverse de la BAN \([https://api-adresse.data.gouv.fr/reverse/](https://api-adresse.data.gouv.fr/reverse/)\)
* vérification de la cohérence des données entre le code insee reçu de RCO et celui reçu du géocodage inverse

### Intégration de données complémentaires

#### ONISEP \(descriptif formation\)

![](../../.gitbook/assets/onisepformation.png)

