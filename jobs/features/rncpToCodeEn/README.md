# Script de mise à jour des Codes Rncp et Codes Diplômes (En)

Ce script utilise le fichier référentiel de France Compétences pour effectuer 2 types de mises à jour, codes RNCP depuis codes diplômes et vice-versa.

Ce script utilise dotEnv, veillez à avoir le fichier .env à la racine du projet.

Une option de mise à jour "forcée" est accessible, elle est active par défaut et écrase les valeurs existantes si elles sont trouvées dans le kit de France Compétences.

Pour désactiver l'option d'écrasement il faut modifier la variable d'environnement

```sh
OVERRIDE_MODE=false
```

## Mise à jour des Codes Rncp depuis les Codes Diplômes

La variable currentEnv correspond à l'environnement souhaité (local, dev ou prod)

```sh
yarn
STAGE=currentEnv UPDATE_MODE=updateCodeRncpFromCodeEn yarn start
```

## Mise à jour des Codes Diplômes depuis Codes RNCP

La variable currentEnv correspond à l'environnement souhaité (local, dev ou prod)

```sh
yarn
STAGE=currentEnv UPDATE_MODE=updateCodeEnFromCodeRncp yarn start
```

## Affichage des statistiques

La variable currentEnv correspond à l'environnement souhaité (local, dev ou prod)
Il est possible de consulter les statistiques des formations avec / sans ces codes RNCP / Diplomes.

```sh
yarn
STAGE=currentEnv yarn stats
```
