# Université API — NestJS, MongoDB, JWT Auth & RBAC

API REST sécurisée pour la gestion d’une université, développée avec NestJS et MongoDB. Ce projet intègre l’authentification JWT, l’autorisation basée sur les rôles (RBAC), des Guards pour la protection des endpoints, et une intégration complète avec Mongoose.

Base URL: http://localhost:3000/api

## Fonctionnalités

- Authentification stateless avec JWT (login/register)
- Autorisation basée sur les rôles (ADMIN, ETUDIANT)
- Protection des routes via JwtAuthGuard et RolesGuard
- Intégration MongoDB via Mongoose (schemas, modules)
- Organisation modulaire (Auth, Utilisateurs, Options, Admin)
- Chargement des variables d’environnement (ConfigModule)
- Middleware de logs (LoggerMiddleware)
- Gestion propre des erreurs HTTP (HttpExceptionFilter)

## Stack technique

- Runtime: Node.js (>= 18 recommandé)
- Framework: NestJS (TypeScript)
- Base de données: MongoDB
- Auth: Passport + JWT
- Validation: class-validator / class-transformer
- ODM: Mongoose

## Structure du projet (extraits)

- src/
  - app.module.ts
  - main.ts
  - logger/
    - logger.middleware.ts
  - common/filters/http-exception/
    - http-exception.filter.ts
  - auth/
    - auth.module.ts
    - auth.controller.ts
    - auth.service.ts
    - jwt.strategy.ts
    - jwt-auth.guard.ts
    - roles.guard.ts
    - roles.decorator.ts
    - dto/
      - create-auth.dto.ts
      - login.dto.ts
  - utilisateurs/
    - utilisateurs.module.ts
    - utilisateurs.controller.ts
    - utilisateurs.service.ts
    - admin.module.ts
    - admin.controller.ts
    - schemas/utilisateur/utilisateur.ts
  - options/
    - options.module.ts
    - options.controller.ts
    - options.service.ts
    - schemas/option.schema.ts
- prosites/ (prosit 2, 3, 4 importés)
- seed.js
- .env

## Prérequis

- Node.js >= 18
- MongoDB en local (ou un cluster accessible)
- npm >= 9
- macOS/Linux/WSL recommandé

## Installation

```bash
npm install
```

Créer un fichier .env à la racine:

```env
# Connexion Mongo et config serveur
MONGO_URI=mongodb://localhost:27017/universite
PORT=3000

# JWT
JWT_SECRET=changeme_dev_secret    # Remplacez par un secret fort en prod (>= 32 chars)
JWT_EXPIRES_IN=1h
```

Démarrage:

```bash
# développement (watch)
npm run start:dev

# production
npm run start:prod
```

MongoDB doit être démarré avant (par exemple via brew services start mongodb-community sur macOS).

## Données d’exemple (seed)

Un script de seed est fourni.

```bash
node seed.js
```

Sinon, vous pouvez créer les comptes via l’endpoint /auth/register (voir ci-dessous).

## Authentification et Rôles

- Rôles supportés: ADMIN, ETUDIANT
- Les JWT incluent: sub, email, role, iat, exp
- Le même secret JWT est utilisé pour signer et vérifier (via JwtModule.registerAsync + ConfigService)

Important: l’utilisation de JwtModule.registerAsync garantit que les variables d’environnement sont chargées avant la configuration JWT, évitant les erreurs 401 dues à des secrets différents au moment de la signature/vérification.

## Endpoints principaux

- Auth
  - POST /api/auth/register
  - POST /api/auth/login
- Utilisateurs
  - GET /api/utilisateurs
  - GET /api/utilisateurs/:id
  - POST /api/utilisateurs            (ADMIN)
  - PATCH /api/utilisateurs/:id       (ADMIN)
  - DELETE /api/utilisateurs/:id      (ADMIN)
- Options
  - GET /api/options
  - GET /api/options/:id
  - POST /api/options                 (ADMIN)
  - PATCH /api/options/:id            (ADMIN)
  - DELETE /api/options/:id           (ADMIN)
- Admin (exemples protégés)
  - GET /api/admin/whoami             (JWT)
  - GET /api/admin/profile            (ADMIN, ETUDIANT)
  - GET /api/admin/dashboard          (ADMIN)

Règles d’accès:
- ADMIN: accès total (GET/POST/PATCH/DELETE)
- ETUDIANT: lecture seule (GET)

## Exemples de requêtes (cURL)

Créer un ADMIN:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Admin","lastName":"User","studentId":"ADMIN001",
    "email":"admin@example.tn","age":30,"password":"admin123","role":"ADMIN"
  }'
```

Créer un ETUDIANT:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Student","lastName":"User","studentId":"STU001",
    "email":"student@example.tn","age":22,"password":"student123","role":"ETUDIANT"
  }'
```

Login:

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.tn","password":"admin123"}' | jq -r '.access_token')

STUDENT_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.tn","password":"student123"}' | jq -r '.access_token')
```

Accès protégé (whoami):

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/admin/whoami
```

Vérification des règles:
- Étudiant ne peut pas créer (403 attendu)

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "Content-Type: application/json" \
  -d '{"firstName":"X","lastName":"Y","studentId":"STU999","email":"x@y.tn","age":20,"password":"xxxxxx","role":"ETUDIANT"}' \
  http://localhost:3000/api/utilisateurs
```

- Admin peut créer (201 attendu)

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"firstName":"New","lastName":"User","studentId":"STU002","email":"new@example.tn","age":21,"password":"password","role":"ETUDIANT"}' \
  http://localhost:3000/api/utilisateurs
```

## Bonnes pratiques et sécurité

- Toujours définir JWT_SECRET dans .env (ne pas commiter ce fichier)
- Utiliser JwtModule.registerAsync avec ConfigService
- Mettre en place HTTPS en production
- Définir des durées d’expiration adaptées (JWT_EXPIRES_IN)
- Logger les accès et erreurs (LoggerMiddleware, HttpExceptionFilter)
- Valider toutes les entrées avec class-validator

## Dépannage (401 Unauthorized)

- Vérifier l’en-tête Authorization: Bearer <token>
- Vérifier JWT_SECRET et JWT_EXPIRES_IN dans .env
- Redémarrer l’app après modification de .env
- S’assurer que AuthModule est importé là où les Guards sont utilisés
- Vérifier que JwtStrategy est bien dans providers d’AuthModule
- Vérifier l’horloge système (iat/exp)

## Prosits

Les livrables des prosits sont regroupés ici et numérotés:

1. Prosit 2 — Bases NestJS (Controllers, Services, Modules, DTO)
   - Dossier: [Cliquer ici](./prosites/Prosit%202.pdf)
2. Prosit 3 — Intégration MongoDB, Mongoose, ConfigModule et variables d’environnement
   - Dossier: [Cliquer ici](./prosites/Prosit3.pdf)
3. Prosit 4 — Authentification JWT, Autorisation par rôles (RBAC), Guards, intégration complète Mongoose
   - Dossier: [Cliquer ici](./prosites/Prosit4.docx)

## Scripts utiles

```bash
# Lancement (dev)
npm run start:dev

# Lancement (prod)
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Seed
node seed.js
```

## A propos

Projet académique réalisé dans le cadre d’un prosit de l’université [ESPRIT](https://www.esprit.tn/).

Auteur: Karim Feki  
Email: [feki.karim28@gmail.com](mailto:feki.karim28@gmail.com)  
LinkedIn: [Cliquer ici](https://www.linkedin.com/in/karimfeki/)  
GitHub: [Cliquer ici](https://github.com/fekikarim)