# Cinema API - Projet Node.js + PostgreSQL

Ce projet est une API REST complète permettant de gérer des films, salles, séances, billets et transactions dans un contexte de cinéma.

## Lancer le projet en local

### 1. Pré-requis

- [Docker](https://www.docker.com/) installé
- [Node.js](https://nodejs.org/) 18+ (si tu veux lancer hors docker)

### 2. Cloner les dépôts

```bash
git clone <repo>
cd <repo>
```

### 3. Lancer les containers Docker

```bash
docker-compose up --build
```

Cela lance :

- une base de données PostgreSQL
- l'application Node.js sur http://localhost:3000
- Adminer (GUI BDD) sur http://localhost:8080

### 4. Remplir la base de données

Pour injecter des données de test :

```bash
psql -h localhost -U admin -d mydatabase < fill_db_full_data.sql
```

> Mot de passe : `admin`

---

## Documentation API (Swagger)

Swagger est disponible ici :

http://localhost:3000/docs

Il documente tous les endpoints avec schémas d'entrée/sortie, sécurité, erreurs.

---

## Authentification

Certains endpoints nécessitent un token d'accès JWT :

- Utilise la route `/auth/login` pour récupérer un `access_token`
- Utilise-le dans Postman en header :  
  `Authorization: Bearer {{access_token}}`

> Un `refresh_token` est aussi fourni pour prolonger la session.

---

## Collection Postman

Une collection complète de tests métiers est fournie dans `cinema_business_cases.postman_collection.json`.

- Tests : billets, super tickets, soldes, maintenance, stats, rôles
- Inclut les tokens via variable `{{access_token}}`

---

## Comptes préremplis

| Email              | Mot de passe     | Rôle     |
|-------------------|------------------|----------|
| admin@example.com | admin123 (hashé) | admin    |
| user1@example.com | user123 (hashé)  | client   |

---

## Structure du projet

- `src/db/models/` : entités TypeORM
- `src/handlers/` : handlers REST (routes métier)
- `src/validators/` : schémas Joi
- `src/middleware/` : middleware d'auth et rôles
- `swagger.ts` : doc Swagger
- `docker-compose.yml` : stack complète

---

## À venir

- tests automatisés (`Jest`)
- pagination + filtres
- monitoring + logs production

---