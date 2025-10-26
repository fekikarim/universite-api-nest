# Université API — NestJS, MongoDB, JWT Auth & RBAC

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.en.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./README.md)

API REST sécurisée pour la gestion d'une université, développée avec NestJS et MongoDB. Ce projet intègre l'authentification JWT avec refresh tokens, l'autorisation basée sur les rôles (RBAC), une documentation Swagger interactive, et une gestion complète des sessions utilisateur.

**Base URL:** `http://localhost:3000/api`  
**Documentation Swagger:** `http://localhost:3000/api/docs`

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Structure du Projet](#-structure-du-projet)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Documentation API (Swagger)](#-documentation-api-swagger)
- [Authentification](#-authentification)
- [Endpoints Principaux](#-endpoints-principaux)
- [Exemples de Requêtes](#-exemples-de-requêtes)
- [Gestion des Sessions](#-gestion-des-sessions)
- [Sécurité et Bonnes Pratiques](#-sécurité-et-bonnes-pratiques)
- [Dépannage](#-dépannage)
- [Tests](#-tests)
- [Prosits](#-prosits)
- [Scripts Utiles](#-scripts-utiles)
- [À Propos](#-à-propos)

## ✨ Fonctionnalités

### Authentification & Autorisation
- ✅ Authentification stateless avec JWT (access & refresh tokens)
- ✅ Rotation automatique des refresh tokens
- ✅ Gestion des sessions utilisateur avec suivi IP et User-Agent
- ✅ Autorisation basée sur les rôles (RBAC) : `ADMIN`, `ETUDIANT`
- ✅ Protection des routes via `JwtAuthGuard` et `RolesGuard`
- ✅ Logout individuel et déconnexion de toutes les sessions

### Documentation & Validation
- ✅ Documentation interactive Swagger/OpenAPI
- ✅ Validation automatique des données avec `class-validator`
- ✅ Gestion propre des erreurs HTTP (`HttpExceptionFilter`)
- ✅ Middleware de logs (`LoggerMiddleware`)

### Base de Données & Architecture
- ✅ Intégration MongoDB via Mongoose (schemas, modules)
- ✅ Organisation modulaire (Auth, Utilisateurs, Options, Admin)
- ✅ Chargement sécurisé des variables d'environnement (`ConfigModule`)
- ✅ Upload de fichiers (avatars)

---

## 🛠️ Stack Technique

| Technologie | Version | Description |
|------------|---------|-------------|
| **Node.js** | ≥ 18 | Runtime JavaScript |
| **NestJS** | 11.x | Framework TypeScript progressif |
| **MongoDB** | 8.x | Base de données NoSQL |
| **Mongoose** | 8.x | ODM pour MongoDB |
| **Passport** | 0.7.x | Middleware d'authentification |
| **JWT** | 11.x | JSON Web Tokens |
| **Swagger** | 11.x | Documentation OpenAPI |
| **bcrypt** | 6.x | Hash de mots de passe |
| **class-validator** | 0.14.x | Validation de DTOs |
| **uuid** | 13.x | Génération d'identifiants uniques |

## 📁 Structure du Projet

```
universite-api/
├── src/
│   ├── main.ts                      # Point d'entrée avec config Swagger
│   ├── app.module.ts                # Module racine
│   ├── auth/                        # Module d'authentification
│   │   ├── auth.controller.ts       # Endpoints: login, register, refresh, logout
│   │   ├── auth.service.ts          # Logique métier auth + sessions
│   │   ├── jwt.strategy.ts          # Stratégie JWT pour access tokens
│   │   ├── jwt-refresh.strategy.ts  # Stratégie JWT pour refresh tokens
│   │   ├── jwt-auth.guard.ts        # Guard pour routes protégées
│   │   ├── jwt-refresh.guard.ts     # Guard pour refresh endpoint
│   │   ├── roles.guard.ts           # Guard pour vérification des rôles
│   │   ├── roles.decorator.ts       # Décorateur @Roles()
│   │   ├── dto/                     # Data Transfer Objects
│   │   └── schemas/session/         # Schéma Mongoose des sessions
│   ├── utilisateurs/                # Module utilisateurs
│   │   ├── utilisateurs.controller.ts
│   │   ├── utilisateurs.service.ts
│   │   ├── admin.controller.ts      # Routes admin spécifiques
│   │   └── schemas/utilisateur/     # Schéma Mongoose utilisateur
│   ├── options/                     # Module options académiques
│   │   ├── options.controller.ts
│   │   ├── options.service.ts
│   │   └── schemas/option.schema.ts
│   ├── common/filters/              # Filtres d'exception HTTP
│   └── logger/                      # Middleware de logging
├── test/                            # Tests E2E
├── uploads/avatars/                 # Fichiers uploadés
├── prosites/                        # Documentation des prosits
├── .env                             # Variables d'environnement (non versionné)
├── package.json
└── README.md
```

---

## 📋 Prérequis

- **Node.js** version 18 ou supérieure
- **MongoDB** (local ou cluster distant)
- **npm** version 9 ou supérieure
- **macOS/Linux/WSL** (recommandé)

---

## 🚀 Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/fekikarim/universite-api-nest.git
cd universite-api-nest
```

2. **Installer les dépendances**

```bash
npm install
```

---

## ⚙️ Configuration

Créer un fichier `.env` à la racine du projet :

```env
# Connexion MongoDB
MONGO_URI=mongodb://localhost:27017/universite

# Configuration serveur
PORT=3000

# JWT Configuration
JWT_SECRET=votre_secret_ultra_securise_32_caracteres_minimum
JWT_EXPIRES_IN=15m

# Refresh Token Configuration
JWT_REFRESH_SECRET=votre_refresh_secret_ultra_securise_32_caracteres_minimum
JWT_REFRESH_EXPIRES_IN=7d
```

> ⚠️ **Important :** 
> - Utilisez des secrets forts (≥ 32 caractères) générés aléatoirement
> - Ne committez JAMAIS le fichier `.env`
> - En production, utilisez des variables d'environnement sécurisées

**Exemple de génération de secrets sécurisés :**

```bash
# Sur macOS/Linux
openssl rand -base64 32
```

---

## 🎬 Démarrage

### 1. Démarrer MongoDB

```bash
# macOS (avec Homebrew)
brew services start mongodb-community

# Linux (avec systemd)
sudo systemctl start mongod

# Ou via Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Lancer l'application

**Mode développement (avec hot-reload) :**

```bash
npm run start:dev
```

**Mode production :**

```bash
npm run build
npm run start:prod
```

### 3. Vérifier le démarrage

L'application affichera :

```
Application is running on: http://localhost:3000/api
Swagger docs available at: http://localhost:3000/api/docs
```

---

## 📚 Documentation API (Swagger)

Une documentation interactive complète est disponible via Swagger UI :

**URL :** `http://localhost:3000/api/docs`

### Fonctionnalités Swagger

- 📖 Documentation détaillée de tous les endpoints
- 🧪 Interface de test interactive (Try it out)
- 🔐 Support de l'authentification Bearer JWT
- 📋 Schémas de données et exemples
- 🏷️ Organisation par tags (Auth, Utilisateurs, Options)

### Utilisation

1. Accéder à `http://localhost:3000/api/docs`
2. Tester un endpoint de login pour obtenir un token
3. Cliquer sur le bouton **"Authorize"** en haut à droite
4. Entrer le token au format : `Bearer votre_access_token`
5. Tester les endpoints protégés directement depuis l'interface

---

## 🔐 Authentification

### Architecture JWT avec Refresh Tokens

L'API utilise un système d'authentification à deux tokens :

#### Access Token
- **Durée de vie :** 15 minutes (configurable)
- **Usage :** Authentification des requêtes API
- **Stockage :** Mémoire côté client (jamais en localStorage pour la sécurité)
- **Payload :** `{ sub, email, role, iat, exp }`

#### Refresh Token
- **Durée de vie :** 7 jours (configurable)
- **Usage :** Renouvellement des access tokens
- **Stockage :** Sécurisé (HttpOnly cookies recommandé en production)
- **Payload :** `{ sub, email, role, jti, sessionId, iat, exp }`
- **Rotation :** Nouveau refresh token à chaque utilisation

### Rôles et Permissions

| Rôle | Permissions |
|------|------------|
| **ADMIN** | Accès complet (CREATE, READ, UPDATE, DELETE) |
| **ETUDIANT** | Lecture seule (READ) |

### Flux d'Authentification

```
1. Login → { accessToken, refreshToken }
2. Utiliser accessToken pour les requêtes API
3. Quand accessToken expire → POST /auth/refresh avec refreshToken
4. Recevoir nouveaux { accessToken, refreshToken }
5. Logout → POST /auth/logout pour révoquer la session
```

---

## 🌐 Endpoints Principaux

### 🔑 Auth (`/api/auth`)

| Méthode | Endpoint | Guard | Rôles | Description |
|---------|----------|-------|-------|-------------|
| POST | `/register` | - | - | Créer un nouveau compte |
| POST | `/login` | - | - | Se connecter et créer une session |
| POST | `/refresh` | RefreshGuard | - | Renouveler les tokens |
| POST | `/logout` | RefreshGuard | - | Déconnexion session actuelle |
| POST | `/logout-all` | RefreshGuard | - | Déconnexion toutes sessions |

### 👥 Utilisateurs (`/api/utilisateurs`)

| Méthode | Endpoint | Guard | Rôles | Description |
|---------|----------|-------|-------|-------------|
| GET | `/` | JwtGuard | ALL | Liste tous les utilisateurs |
| GET | `/:id` | JwtGuard | ALL | Détails d'un utilisateur |
| POST | `/` | JwtGuard | ADMIN | Créer un utilisateur |
| PATCH | `/:id` | JwtGuard | ADMIN | Modifier un utilisateur |
| DELETE | `/:id` | JwtGuard | ADMIN | Supprimer un utilisateur |

### 📚 Options (`/api/options`)

| Méthode | Endpoint | Guard | Rôles | Description |
|---------|----------|-------|-------|-------------|
| GET | `/` | JwtGuard | ALL | Liste toutes les options |
| GET | `/:id` | JwtGuard | ALL | Détails d'une option |
| POST | `/` | JwtGuard | ADMIN | Créer une option |
| PATCH | `/:id` | JwtGuard | ADMIN | Modifier une option |
| DELETE | `/:id` | JwtGuard | ADMIN | Supprimer une option |

### 🛡️ Admin (`/api/admin`)

| Méthode | Endpoint | Guard | Rôles | Description |
|---------|----------|-------|-------|-------------|
| GET | `/whoami` | JwtGuard | ALL | Informations utilisateur actuel |
| GET | `/profile` | JwtGuard | ADMIN, ETUDIANT | Profil détaillé |
| GET | `/dashboard` | JwtGuard | ADMIN | Tableau de bord admin |

---

## 📝 Exemples de Requêtes

### Configuration Initiale

```bash
# Définir les variables d'environnement pour la sécurité
export API_BASE_URL="http://localhost:3000/api"
export ADMIN_EMAIL="admin@universite.tn"
export ADMIN_PASSWORD="SecurePassword123!"
export STUDENT_EMAIL="etudiant@universite.tn"
export STUDENT_PASSWORD="SecurePassword456!"
```

### 1. Créer un Compte Admin

```bash
curl -X POST "${API_BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Admin\",
    \"lastName\": \"Système\",
    \"studentId\": \"ADMIN001\",
    \"email\": \"${ADMIN_EMAIL}\",
    \"age\": 30,
    \"password\": \"${ADMIN_PASSWORD}\",
    \"role\": \"ADMIN\"
  }"
```

### 2. Créer un Compte Étudiant

```bash
curl -X POST "${API_BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Jean\",
    \"lastName\": \"Dupont\",
    \"studentId\": \"ETU001\",
    \"email\": \"${STUDENT_EMAIL}\",
    \"age\": 22,
    \"password\": \"${STUDENT_PASSWORD}\",
    \"role\": \"ETUDIANT\"
  }"
```

### 3. Login et Récupération des Tokens

```bash
# Login Admin
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\"
  }")

# Extraire les tokens (nécessite jq)
ADMIN_ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
ADMIN_REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

echo "Access Token: ${ADMIN_ACCESS_TOKEN}"
```

### 4. Utiliser un Access Token

```bash
# Récupérer tous les utilisateurs
curl -X GET "${API_BASE_URL}/utilisateurs" \
  -H "Authorization: Bearer ${ADMIN_ACCESS_TOKEN}"
```

### 5. Renouveler les Tokens

```bash
# Utiliser le refresh token pour obtenir de nouveaux tokens
REFRESH_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/refresh" \
  -H "Authorization: Bearer ${ADMIN_REFRESH_TOKEN}")

# Nouveaux tokens
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.refreshToken')
```

### 6. Créer un Utilisateur (ADMIN uniquement)

```bash
curl -X POST "${API_BASE_URL}/utilisateurs" \
  -H "Authorization: Bearer ${ADMIN_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Marie\",
    \"lastName\": \"Martin\",
    \"studentId\": \"ETU002\",
    \"email\": \"marie.martin@universite.tn\",
    \"age\": 21,
    \"password\": \"SecurePassword789!\",
    \"role\": \"ETUDIANT\"
  }"
```

### 7. Test des Permissions (Étudiant tente de créer → 403)

```bash
# Login étudiant
STUDENT_LOGIN=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${STUDENT_EMAIL}\",
    \"password\": \"${STUDENT_PASSWORD}\"
  }")

STUDENT_TOKEN=$(echo $STUDENT_LOGIN | jq -r '.accessToken')

# Tentative de création (devrait retourner 403 Forbidden)
curl -X POST "${API_BASE_URL}/utilisateurs" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Test\",
    \"studentId\": \"TEST001\",
    \"email\": \"test@test.tn\",
    \"age\": 20,
    \"password\": \"test123\",
    \"role\": \"ETUDIANT\"
  }"
```

### 8. Déconnexion

```bash
# Déconnexion session actuelle
curl -X POST "${API_BASE_URL}/auth/logout" \
  -H "Authorization: Bearer ${ADMIN_REFRESH_TOKEN}"

# Déconnexion de TOUTES les sessions
curl -X POST "${API_BASE_URL}/auth/logout-all" \
  -H "Authorization: Bearer ${ADMIN_REFRESH_TOKEN}"
```

---

## 🔄 Gestion des Sessions

### Schéma de Session

Chaque session stocke :

```typescript
{
  userId: ObjectId,           // ID de l'utilisateur
  jti: string,                // JWT ID unique (UUID v4)
  refreshToken: string,       // Hash du refresh token
  ipAddress: string,          // Adresse IP de connexion
  userAgent: string,          // User-Agent du client
  createdAt: Date,            // Date de création
  expiresAt: Date,            // Date d'expiration
  isRevoked: boolean          // Statut de révocation
}
```

### Sécurité des Sessions

- ✅ **Rotation des tokens** : Nouveau refresh token à chaque utilisation
- ✅ **Révocation** : Invalidation immédiate via `isRevoked`
- ✅ **Traçabilité** : Suivi IP et User-Agent
- ✅ **Expiration** : Nettoyage automatique des sessions expirées
- ✅ **Multi-device** : Support de plusieurs sessions simultanées

---

## 🔒 Sécurité et Bonnes Pratiques

### ⚠️ Règles Critiques

1. **Ne JAMAIS committer** :
   - Fichier `.env`
   - Mots de passe en clair
   - Secrets JWT
   - Identifiants de base de données

2. **Secrets Forts** :
   - Minimum 32 caractères
   - Générés aléatoirement (ex: `openssl rand -base64 32`)
   - Différents entre `JWT_SECRET` et `JWT_REFRESH_SECRET`

3. **Gestion des Tokens** :
   - Access token : courte durée (15min recommandé)
   - Refresh token : durée modérée (7 jours max)
   - Stockage sécurisé côté client (HttpOnly cookies en production)

4. **Variables d'Environnement** :
   - Utiliser des gestionnaires de secrets (Vault, AWS Secrets Manager)
   - Variables différentes par environnement (dev/staging/prod)

### En Cas de Compromission

Si un secret ou mot de passe est exposé :

1. **Immédiatement** :
   ```bash
   # Révoquer toutes les sessions
   curl -X POST "${API_BASE_URL}/auth/logout-all" \
     -H "Authorization: Bearer ${REFRESH_TOKEN}"
   ```

2. **Changer les secrets** dans `.env` :
   ```env
   JWT_SECRET=nouveau_secret_genere_aleatoirement
   JWT_REFRESH_SECRET=nouveau_refresh_secret_genere_aleatoirement
   ```

3. **Redémarrer l'application** :
   ```bash
   npm run start:dev
   ```

4. **Nettoyer l'historique Git** si nécessaire :
   ```bash
   # Utiliser git-filter-repo ou BFG Repo-Cleaner
   git filter-repo --path .env --invert-paths
   ```

5. **Réinitialiser les mots de passe** des comptes compromis

### Recommandations Production

- ✅ Utiliser HTTPS uniquement
- ✅ Configurer CORS strictement
- ✅ Implémenter rate limiting
- ✅ Logger les tentatives d'authentification
- ✅ Monitorer les sessions actives
- ✅ Mettre en place des alertes de sécurité
- ✅ Utiliser des HttpOnly cookies pour les refresh tokens
- ✅ Implémenter CSP (Content Security Policy)

---

## 🔧 Dépannage

### Erreur 401 Unauthorized

**Causes possibles :**

1. **Token expiré**
   ```bash
   # Solution : Utiliser le refresh token
   curl -X POST "${API_BASE_URL}/auth/refresh" \
     -H "Authorization: Bearer ${REFRESH_TOKEN}"
   ```

2. **Header Authorization incorrect**
   ```bash
   # ❌ Incorrect
   -H "Authorization: ${TOKEN}"
   
   # ✅ Correct
   -H "Authorization: Bearer ${TOKEN}"
   ```

3. **Secrets JWT différents**
   - Vérifier `JWT_SECRET` dans `.env`
   - Redémarrer l'application après modification

4. **Token JWT malformé**
   - Vérifier qu'il y a 3 parties séparées par des points
   - Pas d'espaces ni de caractères spéciaux

### Erreur 403 Forbidden

**Cause :** Permissions insuffisantes

```bash
# Vérifier le rôle de l'utilisateur
curl -X GET "${API_BASE_URL}/admin/whoami" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

**Solution :** Utiliser un compte ADMIN pour les opérations CREATE/UPDATE/DELETE

### MongoDB Connection Failed

```bash
# Vérifier que MongoDB est démarré
brew services list | grep mongodb

# Si arrêté, démarrer
brew services start mongodb-community

# Vérifier la connexion
mongosh mongodb://localhost:27017/universite
```

### Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=3001
```

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Couverture de code
npm run test:cov

# Mode watch
npm run test:watch
```

---


## 📖 Prosits

Documentation académique des différents prosits :

1. **Prosit 2** — Bases NestJS (Controllers, Services, Modules, DTO)
   - [📄 Documentation](./prosites/Prosit%202.pdf)

2. **Prosit 3** — Intégration MongoDB, Mongoose, ConfigModule
   - [📄 Documentation](./prosites/Prosit3.pdf)

3. **Prosit 4** — Authentification JWT, RBAC, Guards, Mongoose
   - [📄 Documentation](./prosites/Prosit4.docx)

4. **Prosit 5** — Refresh Tokens, Sessions, Swagger
   - Fonctionnalités intégrées dans ce projet

---

## 📜 Scripts Utiles

```bash
# Développement
npm run start:dev        # Mode watch avec hot-reload
npm run start:debug      # Mode debug

# Production
npm run build            # Compiler TypeScript → JavaScript
npm run start:prod       # Démarrer en mode production

# Code Quality
npm run format           # Formater le code avec Prettier
npm run lint             # Vérifier avec ESLint
npm run lint -- --fix    # Corriger automatiquement

# Tests
npm run test             # Tests unitaires
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Rapport de couverture
```

---

## 👨‍💻 À Propos

### Projet Académique

Projet réalisé dans le cadre du cursus de **4ème année SIM** à [ESPRIT](https://www.esprit.tn/) — École Supérieure Privée d'Ingénierie et de Technologies.

### Auteur

**Karim Feki**  
Étudiant Ingénieur en Systèmes d'Information et Multimédia

- 📧 Email : [feki.karim28@gmail.com](mailto:feki.karim28@gmail.com)
- 💼 LinkedIn : [linkedin.com/in/karimfeki](https://www.linkedin.com/in/karimfeki/)
- 🐙 GitHub : [github.com/fekikarim](https://github.com/fekikarim)

---

## 🙏 Remerciements

- L'équipe NestJS pour le framework exceptionnel
- La communauté MongoDB pour Mongoose
- Les enseignants et l'administration d'ESPRIT

---

**Version :** 1.0.0  
**Dernière mise à jour :** Octobre 2025

[![Made with NestJS](https://img.shields.io/badge/Made%20with-NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
