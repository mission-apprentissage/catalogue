# Prise en main

## Stack

* React
* Lambda
* Node
* Mongo
* Es

## Développement

### Getting started

* Donner mon IP pour whitelist
* Avoir le script setEnv.sh à demander à l'équipe
* Avoir robomongo [https://robomongo.org/](https://robomongo.org/)
* Configurer la variable d'envrironement `STAGE` à `dev` ou `prod` \(peut être set à la volé `STAGE="dev" yarn ...`\)

### tl;dr mount local env

```bash
yarn
source setEnv.sh
STAGE="dev" npm run docker:start
STAGE="dev" npm run mongodb:dump
STAGE="dev" npm run es:dump
```

Mongo local: 127.0.0.1:27017 Kibana local: [http://localhost:5601/](http://localhost:5601/) ES local: [http://localhost:9200](http://localhost:9200)

### Docker

Il est possible de démarrer en local des containers Docker \(Elastichsearch, MongoDB,...\) en lançant la commande :

```bash
npm run docker:start
```

Pour stopper et détruire la stack :

```bash
npm run docker:stop
npm run docker:destroy
```

Pour information, ces tâches npm utilisent docker-compose \(cf. `docker-compose.yml`\).

**Elasticsearch**

Une fois les containers démarrés, il est possible de charger les données dans Elasticsearch en lançant la commande :

```bash
ES_URL="<url elasticsearch>" npm run es:dump
```

Cette tâche npm utilise un script bash contenu dans `tools/elasticsearch`.

La variable `ES_URL` doit contenir l'url d'un Elasticsearch qui contient les indexes `etablissements`, `formations` et `domainesmetiers` \(ex: staging\)

Il est également possible de réaliser un backup d'une instance Elasticsearch :

```bash
ES_URL="<url elasticsearch>" npm run es:backup
```

Cette tâche va créer un `tar.gz` dans le répertoire `.data/elasticsearch/backups`

**MongoDB**

Une fois les containers démarrés, il est possible de charger les données dans MongoDB en lançant la commande :

```bash
MONGODB_URL="<url mongodb>" npm run mongodb:dump
```

Cette tâche npm utilise un script bash contenu dans `tools/mongodb`.

La variable `MONGODB_URL` doit contenir l'url d'un MongoDB \(ex: staging\)

Il est également possible de réaliser un backup d'une base :

```bash
MONGODB_URL="<url mongodb>" npm run mongodb:backup
```

Cette tâche va créer un répertoire dans le répertoire `.data/mongodb/backups`

### Accéder en local

Mongo local: 127.0.0.1:27017 ES local: [http://localhost:9200](http://localhost:9200) Kibana local: [http://localhost:5601/](http://localhost:5601/)

