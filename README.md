# Université API — NestJS, MongoDB, JWT Auth, Refresh Tokens & RBAC

[Français](#français) | [English](#english)

Base URL: http://localhost:3000/api

---

## Français

### Vue d’ensemble

API REST sécurisée pour la gestion d’une université, développée avec NestJS et MongoDB. Le projet implémente l’authentification avec tokens d’accès (JWT) à courte durée et tokens de rafraîchissement sécurisés en cookie httpOnly, l’autorisation par rôles (RBAC), un stockage de sessions, la rotation de refresh tokens, la détection de réutilisation (reuse), des Guards et des bonnes pratiques de sécurité (rate limiting, headers, CORS).

### Fonctionnalités clés

- Authentification JWT (access token court, refresh token long en cookie httpOnly)
- Rotation du refresh token et détection de réutilisation (révocation globale en cas de reuse)
- Sessions persistantes en base (Mongo) avec hash du refresh token (bcrypt)
- Logout (session courante) et Logout-All (toutes les sessions de l’utilisateur)
- Autorisation basée sur les rôles (ADMIN, ETUDIANT) via Guards
- Validation des DTO (class-validator) et gestion des erreurs (HttpExceptionFilter)
- Rate limiting (Throttler) sur /auth/login et /auth/refresh
- Swagger/OpenAPI à http://localhost:3000/api/docs
- Sécurisation headers (Helmet) et cookies (httpOnly, SameSite, Secure en prod)

### Stack technique

- Node.js ≥ 18, NestJS (TypeScript)
- MongoDB + Mongoose
- Passport JWT (strategies: jwt, jwt-refresh)
- class-validator, class-transformer
- @nestjs/throttler, helmet, cookie-parser

### Architecture (extrait)

- src/
  - auth/ (module, controller, service, strategies, guards, DTOs)
  - utilisateurs/ (module, controller, service, schema)
  - options/ (module, controller, service, schema)
  - common/filters/http-exception/
  - main.ts, app.module.ts

### Prérequis

- Node.js ≥ 18, npm ≥ 9
- MongoDB local (ou cluster)
- macOS/Linux/WSL recommandé

### Installation

```bash
npm install
```

### Configuration (.env)

Créez un fichier .env à la racine (ne commitez jamais de secrets):

```env
# Serveur
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/universite

# JWT accès (court)
JWT_SECRET=<CHANGE_ME_STRONG_SECRET>
JWT_EXPIRES_IN=15m

# Refresh token (long)
REFRESH_TOKEN_SECRET=<CHANGE_ME_STRONG_REFRESH_SECRET>
REFRESH_TOKEN_TTL=7d

# CORS (optionnel, si front sur autre domaine)
# CORS_ORIGIN=https://app.example.com

# NODE_ENV=production
```

Conseils sécurité:
- Utilisez des secrets forts (≥ 32 chars), différents pour access/refresh.
- Ne commitez aucune valeur sensible. Préférez un .env.local non versionné.

### Démarrage

```bash
# développement
npm run start:dev

# production
npm run start:prod
```

### Conception AuthN/AuthZ

- Access token (JWT) court (ex: 15 min) — transmis en Authorization: Bearer.
- Refresh token long (ex: 7 jours) — stocké en cookie httpOnly, SameSite strict (ou None + Secure en cross-site).
- À chaque /auth/refresh: rotation du refresh token (nouveau jti, nouvelle session), l’ancien est marqué remplacé.
- Réutilisation d’un refresh ancien (reuse) → détection et révocation de toutes les sessions de l’utilisateur.
- Sessions: { userId (string), jti, refreshTokenHash (bcrypt), expiresAt, revokedAt, replacedBy, ip, userAgent } avec index TTL sur expiresAt.
- Endpoints: /auth/login, /auth/refresh, /auth/logout, /auth/logout-all, /auth/register.

### Endpoints principaux

- Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
  - POST /api/auth/logout
  - POST /api/auth/logout-all
- Utilisateurs
  - GET /api/utilisateurs
  - GET /api/utilisateurs/:id
  - POST /api/utilisateurs (ADMIN)
  - PATCH /api/utilisateurs/:id (ADMIN)
  - DELETE /api/utilisateurs/:id (ADMIN)
- Options (similaire)
- Admin (exemples)

### Tests rapides (cURL + jq)

```bash
brew install jq # si nécessaire

# 1) Login (écrit un cookie httpOnly refresh_token)
curl -sv -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.tn","password":"<PASSWORD>"}' \
  -c cookies.txt | jq .

# 2) Appeler route protégée avec l'access token (remplacez $ACCESS)
ACCESS=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@example.tn","password":"<PASSWORD>"}' -c cookies.txt | jq -r '.accessToken')
curl -s -X GET http://localhost:3000/api/utilisateurs \
  -H "Authorization: Bearer $ACCESS" | jq .

# 3) Refresh (lit le cookie et le rotate, renvoie un nouveau access token)
curl -s -X POST http://localhost:3000/api/auth/refresh -b cookies.txt -c cookies.txt | jq .

# 4) Logout (révoque la session courante et efface le cookie)
curl -s -X POST http://localhost:3000/api/auth/logout -b cookies.txt | jq .

# 5) Logout-All (révoque toutes les sessions)
curl -s -X POST http://localhost:3000/api/auth/logout-all -b cookies.txt | jq .
```

### Swagger / OpenAPI

- Documentation interactive: http://localhost:3000/api/docs
- Authentification: Bearer pour access token; Cookie (refresh_token) pour refresh/logout.

### CORS & Cookies

- Même origine (local): SameSite=strict, secure=false acceptable en dev.
- Cross-site (prod): SameSite=None; Secure=true et activer CORS avec credentials.

### Rate limiting (Throttler)

- Limites configurées sur /auth/login et /auth/refresh (429 en cas d’abus).
- Les en-têtes X-RateLimit-* sont exposés.

### Dépannage

- 401 après modification du .env → redémarrez le serveur.
- 401 sur refresh → vérifier présence du cookie, jti, révocation/expiration de session.
- 429 sur login → attendre la fenêtre (ttl) avant de retester.

---

## English

### Overview

Secure REST API for a university system built with NestJS and MongoDB. It implements short-lived access tokens (JWT) and long-lived refresh tokens stored in httpOnly cookies, role-based access control (RBAC), persistent session storage, refresh token rotation with reuse detection, guards, throttling, and best-practice security headers.

### Key features

- JWT authentication (short access token, long refresh token in httpOnly cookie)
- Refresh token rotation and reuse detection (global revocation on reuse)
- Persistent sessions in Mongo (refresh token stored as bcrypt hash)
- Logout (current session) and Logout-All (all user sessions)
- Role-based authorization (ADMIN, ETUDIANT) via guards
- DTO validation and consistent HTTP error handling
- Throttling on /auth/login and /auth/refresh
- Swagger/OpenAPI at http://localhost:3000/api/docs
- Security headers (Helmet) and secure cookie settings

### Tech stack

- Node.js ≥ 18, NestJS (TypeScript)
- MongoDB + Mongoose
- Passport JWT (strategies: jwt, jwt-refresh)
- class-validator, class-transformer
- @nestjs/throttler, helmet, cookie-parser

### Prerequisites

- Node.js ≥ 18, npm ≥ 9
- MongoDB running locally or remotely

### Setup

```bash
npm install
```

### Configuration (.env)

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/universite

JWT_SECRET=<CHANGE_ME_STRONG_SECRET>
JWT_EXPIRES_IN=15m

REFRESH_TOKEN_SECRET=<CHANGE_ME_STRONG_REFRESH_SECRET>
REFRESH_TOKEN_TTL=7d

# CORS_ORIGIN=https://app.example.com
# NODE_ENV=production
```

Never commit secrets. Use strong, distinct secrets for access and refresh tokens.

### Run

```bash
npm run start:dev   # development
npm run start:prod  # production
```

### Auth design

- Access token (short) sent via Authorization header.
- Refresh token (long) stored in httpOnly cookie; rotation on every refresh.
- Reuse detection revokes all sessions for the user.
- Sessions schema: userId (string), jti, refreshTokenHash, expiresAt, revokedAt, replacedBy, ip, userAgent (TTL index on expiresAt).
- Endpoints: /auth/register, /auth/login, /auth/refresh, /auth/logout, /auth/logout-all.

### Quick test (cURL + jq)

```bash
# Login (writes httpOnly cookie)
curl -sv -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.tn","password":"<PASSWORD>"}' \
  -c cookies.txt | jq .

# Refresh (reads/rotates cookie and returns a new access token)
curl -s -X POST http://localhost:3000/api/auth/refresh -b cookies.txt -c cookies.txt | jq .

# Logout (revokes current session and clears cookie)
curl -s -X POST http://localhost:3000/api/auth/logout -b cookies.txt | jq .
```

### Swagger / OpenAPI

Open http://localhost:3000/api/docs and use Bearer auth (access token) and Cookie auth (refresh_token) where applicable.

### CORS & Cookies

- Same-origin dev: SameSite=strict, secure=false.
- Cross-site prod: SameSite=None; Secure=true and CORS with credentials enabled.

### Troubleshooting

- 401 after env changes → restart the server.
- 401 on refresh → ensure cookie is present, session not revoked/expired.
- 429 on login → hitting throttling limits; wait for the window to reset.

---

## Scripts utiles / Useful scripts

```bash
# Dev
npm run start:dev

# Prod
npm run start:prod

# Tests unit/e2e (si configurés)
npm run test
npm run test:e2e
npm run test:cov

# Seed (optionnel)
node seed.js
```

## Sécurité / Security

- Ne commitez pas d’identifiants ni de secrets. Never commit credentials or secrets.
- En cas d’exposition: changez les mots de passe, régénérez les secrets, révoquez les sessions, et purgez l’historique si nécessaire.
- `.env` doit rester ignoré par Git.

## A propos / About

Projet académique réalisé dans le cadre d’un prosit de l’université ESPRIT.

Auteur: Karim Feki  
Email: feki.karim28@gmail.com  
LinkedIn: https://www.linkedin.com/in/karimfeki/  
GitHub: https://github.com/fekikarim