# Apptit

Apptit est un monorepo Nx (branche `auth-bootstrap`) avec un microservice d'authentification NestJS, une application React Native/Web de départ et un package Prisma partagé pour la persistance et l'intégration Better Auth.

## Structure

```
apps/
  auth/      # Microservice NestJS (port 4001, préfixe global /api)
  mobile/    # Application React Native + point d'entrée web
packages/
  prisma/    # Schéma Prisma et client partagé (@apptit/prisma)
```

## Prérequis

- Node.js (version recommandée : TODO définir)
- npm
- Postgres (datasource Prisma)

## Mise en place

1) Installer les dépendances :
```sh
npm install
```
2) Configurer les variables d'environnement (ex. `.env` à la racine) :
   - `DATABASE_URL` pointant vers le Postgres utilisé par Prisma.
   - TODO : autres secrets/clefs requis par Better Auth.
3) Préparer la base de données (ajuster le schéma si besoin) :
```sh
npx prisma migrate deploy --schema packages/prisma/schema.prisma
npx prisma generate --schema packages/prisma/schema.prisma
```
4) Compiler le package Prisma (produit `packages/prisma/dist`, consommé via le path `@apptit/prisma`) :
```sh
npx nx build @apptit/prisma
```

## Commandes Nx courantes

- Servir Auth (port 4001, préfixe `/api`) :
```sh
npx nx serve @apptit/auth
```
- Builder Auth :
```sh
npx nx build @apptit/auth
```
- Builder le package Prisma :
```sh
npx nx build @apptit/prisma
```

## Vérifications rapides via curl (Auth en cours d'exécution)

- Healthcheck public :
```sh
curl -i http://localhost:4001/api/health
```
Attendu : HTTP 200.

- Endpoint Better Auth (ne doit pas retourner 500) :
```sh
curl -i http://localhost:4001/api/auth/session
```

## Notes d'architecture

- Microservice Auth en NestJS exposé sous `/api`, utilisant `@thallesp/nestjs-better-auth` ; les routes Better Auth sont sous `basePath: /api/auth`.
- Persistance partagée via `@apptit/prisma` (schéma dans `packages/prisma/schema.prisma`, build dans `packages/prisma/dist`, typings via le path `@apptit/prisma -> packages/prisma/dist/index.d.ts`).
- Le plugin `organization` de Better Auth active le multi-tenant par organisation. Configuration additionnelle des tenants/secrets : TODO documenter.
