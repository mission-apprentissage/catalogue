# Catalogue

## Documentation

https://mission-apprentissage.gitbook.io/catalogue/

# Prise en main

## Stack

- React

- Lambda

- Node

- Mongo

- Es

## Développement

### Getting started

- Donner mon IP pour whitelisting à [Antoine](https://github.com/Gethi)

- Demander les variables d'environnement `.env` à l'équipe et l'insérer dans le projet

- Avoir robomongo [https://robomongo.org/](https://robomongo.org/)

- Configurer la variable d'environnement `STAGE` à `dev` ou `prod`
  \*\* peut être set à la volé `STAGE="dev" yarn ...`
- configurer aws-cli avec les accès disponible dans le .env

```bash
aws configure --profile mna-devops
```

- Utiliser le profile correspondant pour le reste des commandes exécutées

```bash
export AWS_PROFILE=mna-devops
```

```bash
yarn global add dotenv-cli
```

### tl;dr mount local env

```bash
yarn
npm run docker:start
STAGE=dev dotenv npm run mongodb:dump
STAGE=dev dotenv npm run es:dump
```

### Accéder en local

- Mongo local: [127.0.0.1:27017](http://127.0.01:27017)
- Kibana local: [http://localhost:5601/](http://localhost:5601/)
- ES local: [http://localhost:9200](http://localhost:9200)

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

**Update table domainesMetiers**

Pour mettre à jour localement la table domainesMetiers :
- demander la dernière version du fichier source domainesMetiers.xslx 
- le copier dans /jobs/features/domainesMetiers/src/assets

```bash
cd /jobs
yarn
cd /features/domainesMetiers/src
export MONGODB_DBNAME_DEV="mna-dev"
export STAGE="local"
node index.js
```

Cette tâche va réinitialiser la table domainesMetiers dans votre MongoDB et votre ElasticSearch locaux avec les données du fichier. 

### Accéder en local

- Mongo local: [127.0.0.1:27017](http://127.0.01:27017)
- Kibana local: [http://localhost:5601/](http://localhost:5601/)
- ES local: [http://localhost:9200](http://localhost:9200)

