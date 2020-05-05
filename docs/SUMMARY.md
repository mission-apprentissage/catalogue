# Table of contents

* [Présentation](README.md)

## Règles métiers

* [Conventionnement](regles-metiers/conventionnement.md)

## Intégration

* [API](integration/api.md)

## Développements

* [Prise en main](developpements/development.md)
* [Serverless api](developpements/api.md)
* [Services et scripts](developpements/jobs/README.md)
  * [fixes](developpements/jobs/fixes/README.md)
    * [Remove intitule field](developpements/jobs/fixes/removeunusedfields.md)
    * [Etablishments Verification Methods](developpements/jobs/fixes/cleanetablishmentsfromdepp1700file.md)
    * [addTrainingFromDSModel \[mna-services\]](developpements/jobs/fixes/addtrainingfromdsfilemodel.md)
    * [Convert empty value to null](developpements/jobs/fixes/convertemptytonull.md)
    * [Fix Etablihsments with missing sirens using siret](developpements/jobs/fixes/fixmissingsirens.md)
    * [Nettoyage des UAIS en utilisant fichiers de la DEPP](developpements/jobs/fixes/cleanetablishmentsuais.md)
    * [Nettoyage des établissements à partir du fichier DGER](developpements/jobs/fixes/cleanetablishmentsfromdgerfile.md)
    * [Etablishments Verification Methods](developpements/jobs/fixes/cleanetablishmentsfromdepp950file.md)
  * [Template](developpements/jobs/_template.md)
  * [features](developpements/jobs/features/README.md)
    * [formations](developpements/jobs/features/formations/README.md)
      * [Récupération des infos computed établissements dans les formations](developpements/jobs/features/formations/trainingsupdater.md)
      * [Duplicate Handler](developpements/jobs/features/formations/duplicatehandler.md)
    * [Create Catalogue Front Users Accounts](developpements/jobs/features/useraccounts.md)
    * [etablissements](developpements/jobs/features/etablissements/README.md)
      * [Etablishments Verification Methods](developpements/jobs/features/etablissements/etablishmentsupdater.md)
    * [Calcul du coverage des uais \(établissements\) Ypareo dans notre catalogue](developpements/jobs/features/coverageypareo.md)
  * [archives](developpements/jobs/archives/README.md)
    * [Temporary Switch from old es to mongo/es new structure](developpements/jobs/archives/hydratemongo.md)
  * [tools](developpements/jobs/tools/README.md)
    * [Alimentation des environnements](developpements/jobs/tools/synchronizeenvdata.md)
* [Web](developpements/front.md)

