# University API — NestJS, MongoDB, JWT Auth & RBAC

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.en.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./README.md)

Secure REST API for university management, built with NestJS and MongoDB. This project integrates JWT authentication with refresh tokens, Role-Based Access Control (RBAC), interactive Swagger documentation, and comprehensive user session management.

**Base URL:** `http://localhost:3000/api`  
**Swagger Documentation:** `http://localhost:3000/api/docs`

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Getting Started](#-getting-started)
- [API Documentation (Swagger)](#-api-documentation-swagger)
- [Authentication](#-authentication)
- [Main Endpoints](#-main-endpoints)
- [Request Examples](#-request-examples)
- [Session Management](#-session-management)
- [Security & Best Practices](#-security--best-practices)
- [Troubleshooting](#-troubleshooting)
- [Testing](#-testing)
- [Academic Projects](#-academic-projects)
- [Useful Scripts](#-useful-scripts)
- [About](#-about)

---

## ✨ Features

### Authentication & Authorization
- ✅ Stateless JWT authentication (access & refresh tokens)
- ✅ Automatic refresh token rotation
- ✅ User session management with IP and User-Agent tracking
- ✅ Role-Based Access Control (RBAC): `ADMIN`, `ETUDIANT`
- ✅ Route protection via `JwtAuthGuard` and `RolesGuard`
- ✅ Individual logout and logout from all sessions

### Documentation & Validation
- ✅ Interactive Swagger/OpenAPI documentation
- ✅ Automatic data validation with `class-validator`
- ✅ Clean HTTP error handling (`HttpExceptionFilter`)
- ✅ Request logging middleware (`LoggerMiddleware`)

### Database & Architecture
- ✅ MongoDB integration via Mongoose (schemas, modules)
- ✅ Modular organization (Auth, Users, Options, Admin)
- ✅ Secure environment variable loading (`ConfigModule`)
- ✅ File upload support (avatars)

---

## 🛠️ Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| **Node.js** | ≥ 18 | JavaScript Runtime |
| **NestJS** | 11.x | Progressive TypeScript Framework |
| **MongoDB** | 8.x | NoSQL Database |
| **Mongoose** | 8.x | MongoDB ODM |
| **Passport** | 0.7.x | Authentication Middleware |
| **JWT** | 11.x | JSON Web Tokens |
| **Swagger** | 11.x | OpenAPI Documentation |
| **bcrypt** | 6.x | Password Hashing |
| **class-validator** | 0.14.x | DTO Validation |
| **uuid** | 13.x | Unique Identifier Generation |

---

## 📁 Project Structure

```
universite-api/
├── src/
│   ├── main.ts                      # Entry point with Swagger config
│   ├── app.module.ts                # Root module
│   ├── auth/                        # Authentication module
│   │   ├── auth.controller.ts       # Endpoints: login, register, refresh, logout
│   │   ├── auth.service.ts          # Auth business logic + sessions
│   │   ├── jwt.strategy.ts          # JWT strategy for access tokens
│   │   ├── jwt-refresh.strategy.ts  # JWT strategy for refresh tokens
│   │   ├── jwt-auth.guard.ts        # Guard for protected routes
│   │   ├── jwt-refresh.guard.ts     # Guard for refresh endpoint
│   │   ├── roles.guard.ts           # Guard for role verification
│   │   ├── roles.decorator.ts       # @Roles() decorator
│   │   ├── dto/                     # Data Transfer Objects
│   │   └── schemas/session/         # Mongoose session schema
│   ├── utilisateurs/                # Users module
│   │   ├── utilisateurs.controller.ts
│   │   ├── utilisateurs.service.ts
│   │   ├── admin.controller.ts      # Admin-specific routes
│   │   └── schemas/utilisateur/     # Mongoose user schema
│   ├── options/                     # Academic options module
│   │   ├── options.controller.ts
│   │   ├── options.service.ts
│   │   └── schemas/option.schema.ts
│   ├── common/filters/              # HTTP exception filters
│   └── logger/                      # Logging middleware
├── test/                            # E2E tests
├── uploads/avatars/                 # Uploaded files
├── prosites/                        # Academic project documentation
├── .env                             # Environment variables (not versioned)
├── package.json
└── README.md
```

---

## 📋 Prerequisites

- **Node.js** version 18 or higher
- **MongoDB** (local or remote cluster)
- **npm** version 9 or higher
- **macOS/Linux/WSL** (recommended)

---

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/fekikarim/universite-api-nest.git
cd universite-api-nest
```

2. **Install dependencies**

```bash
npm install
```

---

## ⚙️ Configuration

Create a `.env` file at the project root:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/universite

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your_ultra_secure_secret_32_characters_minimum
JWT_EXPIRES_IN=15m

# Refresh Token Configuration
JWT_REFRESH_SECRET=your_ultra_secure_refresh_secret_32_characters_minimum
JWT_REFRESH_EXPIRES_IN=7d
```

> ⚠️ **Important:** 
> - Use strong secrets (≥ 32 characters) randomly generated
> - NEVER commit the `.env` file
> - In production, use secure environment variable management

**Example of secure secret generation:**

```bash
# On macOS/Linux
openssl rand -base64 32
```

---

## 🎬 Getting Started

### 1. Start MongoDB

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (with systemd)
sudo systemctl start mongod

# Or via Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Launch the application

**Development mode (with hot-reload):**

```bash
npm run start:dev
```

**Production mode:**

```bash
npm run build
npm run start:prod
```

### 3. Verify startup

The application will display:

```
Application is running on: http://localhost:3000/api
Swagger docs available at: http://localhost:3000/api/docs
```

---

## 📚 API Documentation (Swagger)

Complete interactive documentation is available via Swagger UI:

**URL:** `http://localhost:3000/api/docs`

### Swagger Features

- 📖 Detailed documentation of all endpoints
- 🧪 Interactive testing interface (Try it out)
- 🔐 Bearer JWT authentication support
- 📋 Data schemas and examples
- 🏷️ Organization by tags (Auth, Users, Options)

### Usage

1. Access `http://localhost:3000/api/docs`
2. Test a login endpoint to obtain a token
3. Click the **"Authorize"** button at the top right
4. Enter the token in the format: `Bearer your_access_token`
5. Test protected endpoints directly from the interface

---

## 🔐 Authentication

### JWT Architecture with Refresh Tokens

The API uses a two-token authentication system:

#### Access Token
- **Lifetime:** 15 minutes (configurable)
- **Usage:** API request authentication
- **Storage:** Client-side memory (never in localStorage for security)
- **Payload:** `{ sub, email, role, iat, exp }`

#### Refresh Token
- **Lifetime:** 7 days (configurable)
- **Usage:** Access token renewal
- **Storage:** Secure (HttpOnly cookies recommended in production)
- **Payload:** `{ sub, email, role, jti, sessionId, iat, exp }`
- **Rotation:** New refresh token on each use

### Roles and Permissions

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access (CREATE, READ, UPDATE, DELETE) |
| **ETUDIANT** | Read-only (READ) |

### Authentication Flow

```
1. Login → { accessToken, refreshToken }
2. Use accessToken for API requests
3. When accessToken expires → POST /auth/refresh with refreshToken
4. Receive new { accessToken, refreshToken }
5. Logout → POST /auth/logout to revoke session
```

---

## 🌐 Main Endpoints

### 🔑 Auth (`/api/auth`)

| Method | Endpoint | Guard | Roles | Description |
|---------|----------|-------|-------|-------------|
| POST | `/register` | - | - | Create a new account |
| POST | `/login` | - | - | Login and create session |
| POST | `/refresh` | RefreshGuard | - | Renew tokens |
| POST | `/logout` | RefreshGuard | - | Logout current session |
| POST | `/logout-all` | RefreshGuard | - | Logout all sessions |

### 👥 Users (`/api/utilisateurs`)

| Method | Endpoint | Guard | Roles | Description |
|---------|----------|-------|-------|-------------|
| GET | `/` | JwtGuard | ALL | List all users |
| GET | `/:id` | JwtGuard | ALL | User details |
| POST | `/` | JwtGuard | ADMIN | Create a user |
| PATCH | `/:id` | JwtGuard | ADMIN | Update a user |
| DELETE | `/:id` | JwtGuard | ADMIN | Delete a user |

### 📚 Options (`/api/options`)

| Method | Endpoint | Guard | Roles | Description |
|---------|----------|-------|-------|-------------|
| GET | `/` | JwtGuard | ALL | List all options |
| GET | `/:id` | JwtGuard | ALL | Option details |
| POST | `/` | JwtGuard | ADMIN | Create an option |
| PATCH | `/:id` | JwtGuard | ADMIN | Update an option |
| DELETE | `/:id` | JwtGuard | ADMIN | Delete an option |

### 🛡️ Admin (`/api/admin`)

| Method | Endpoint | Guard | Roles | Description |
|---------|----------|-------|-------|-------------|
| GET | `/whoami` | JwtGuard | ALL | Current user information |
| GET | `/profile` | JwtGuard | ADMIN, ETUDIANT | Detailed profile |
| GET | `/dashboard` | JwtGuard | ADMIN | Admin dashboard |

---

## 📝 Request Examples

### Initial Setup

```bash
# Set environment variables for security
export API_BASE_URL="http://localhost:3000/api"
export ADMIN_EMAIL="admin@university.edu"
export ADMIN_PASSWORD="SecurePassword123!"
export STUDENT_EMAIL="student@university.edu"
export STUDENT_PASSWORD="SecurePassword456!"
```

### 1. Create an Admin Account

```bash
curl -X POST "${API_BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Admin\",
    \"lastName\": \"System\",
    \"studentId\": \"ADMIN001\",
    \"email\": \"${ADMIN_EMAIL}\",
    \"age\": 30,
    \"password\": \"${ADMIN_PASSWORD}\",
    \"role\": \"ADMIN\"
  }"
```

### 2. Create a Student Account

```bash
curl -X POST "${API_BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"studentId\": \"STU001\",
    \"email\": \"${STUDENT_EMAIL}\",
    \"age\": 22,
    \"password\": \"${STUDENT_PASSWORD}\",
    \"role\": \"ETUDIANT\"
  }"
```

### 3. Login and Retrieve Tokens

```bash
# Admin Login
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\"
  }")

# Extract tokens (requires jq)
ADMIN_ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
ADMIN_REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

echo "Access Token: ${ADMIN_ACCESS_TOKEN}"
```

### 4. Use an Access Token

```bash
# Get all users
curl -X GET "${API_BASE_URL}/utilisateurs" \
  -H "Authorization: Bearer ${ADMIN_ACCESS_TOKEN}"
```

### 5. Refresh Tokens

```bash
# Use refresh token to get new tokens
REFRESH_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/refresh" \
  -H "Authorization: Bearer ${ADMIN_REFRESH_TOKEN}")

# New tokens
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.refreshToken')
```

### 6. Create a User (ADMIN only)

```bash
curl -X POST "${API_BASE_URL}/utilisateurs" \
  -H "Authorization: Bearer ${ADMIN_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Jane\",
    \"lastName\": \"Smith\",
    \"studentId\": \"STU002\",
    \"email\": \"jane.smith@university.edu\",
    \"age\": 21,
    \"password\": \"SecurePassword789!\",
    \"role\": \"ETUDIANT\"
  }"
```

### 7. Test Permissions (Student attempts to create → 403)

```bash
# Student login
STUDENT_LOGIN=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${STUDENT_EMAIL}\",
    \"password\": \"${STUDENT_PASSWORD}\"
  }")

STUDENT_TOKEN=$(echo $STUDENT_LOGIN | jq -r '.accessToken')

# Attempt to create (should return 403 Forbidden)
curl -X POST "${API_BASE_URL}/utilisateurs" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Test\",
    \"studentId\": \"TEST001\",
    \"email\": \"test@test.edu\",
    \"age\": 20,
    \"password\": \"test123\",
    \"role\": \"ETUDIANT\"
  }"
```

### 8. Logout

```bash
# Logout current session
curl -X POST "${API_BASE_URL}/auth/logout" \
  -H "Authorization: Bearer ${ADMIN_REFRESH_TOKEN}"

# Logout ALL sessions
curl -X POST "${API_BASE_URL}/auth/logout-all" \
  -H "Authorization: Bearer ${ADMIN_REFRESH_TOKEN}"
```

---

## 🔄 Session Management

### Session Schema

Each session stores:

```typescript
{
  userId: ObjectId,           // User ID
  jti: string,                // Unique JWT ID (UUID v4)
  refreshToken: string,       // Hashed refresh token
  ipAddress: string,          // Login IP address
  userAgent: string,          // Client User-Agent
  createdAt: Date,            // Creation date
  expiresAt: Date,            // Expiration date
  isRevoked: boolean          // Revocation status
}
```

### Session Security

- ✅ **Token rotation**: New refresh token on each use
- ✅ **Revocation**: Immediate invalidation via `isRevoked`
- ✅ **Traceability**: IP and User-Agent tracking
- ✅ **Expiration**: Automatic cleanup of expired sessions
- ✅ **Multi-device**: Support for multiple simultaneous sessions

---

## 🔒 Security & Best Practices

### ⚠️ Critical Rules

1. **NEVER commit**:
   - `.env` file
   - Plain text passwords
   - JWT secrets
   - Database credentials

2. **Strong Secrets**:
   - Minimum 32 characters
   - Randomly generated (e.g., `openssl rand -base64 32`)
   - Different for `JWT_SECRET` and `JWT_REFRESH_SECRET`

3. **Token Management**:
   - Access token: short duration (15min recommended)
   - Refresh token: moderate duration (7 days max)
   - Secure client-side storage (HttpOnly cookies in production)

4. **Environment Variables**:
   - Use secret managers (Vault, AWS Secrets Manager)
   - Different variables per environment (dev/staging/prod)

### In Case of Compromise

If a secret or password is exposed:

1. **Immediately**:
   ```bash
   # Revoke all sessions
   curl -X POST "${API_BASE_URL}/auth/logout-all" \
     -H "Authorization: Bearer ${REFRESH_TOKEN}"
   ```

2. **Change secrets** in `.env`:
   ```env
   JWT_SECRET=new_randomly_generated_secret
   JWT_REFRESH_SECRET=new_randomly_generated_refresh_secret
   ```

3. **Restart the application**:
   ```bash
   npm run start:dev
   ```

4. **Clean Git history** if necessary:
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   git filter-repo --path .env --invert-paths
   ```

5. **Reset passwords** for compromised accounts

### Production Recommendations

- ✅ Use HTTPS only
- ✅ Configure CORS strictly
- ✅ Implement rate limiting
- ✅ Log authentication attempts
- ✅ Monitor active sessions
- ✅ Set up security alerts
- ✅ Use HttpOnly cookies for refresh tokens
- ✅ Implement CSP (Content Security Policy)

---

## 🔧 Troubleshooting

### Error 401 Unauthorized

**Possible causes:**

1. **Expired token**
   ```bash
   # Solution: Use refresh token
   curl -X POST "${API_BASE_URL}/auth/refresh" \
     -H "Authorization: Bearer ${REFRESH_TOKEN}"
   ```

2. **Incorrect Authorization header**
   ```bash
   # ❌ Incorrect
   -H "Authorization: ${TOKEN}"
   
   # ✅ Correct
   -H "Authorization: Bearer ${TOKEN}"
   ```

3. **Different JWT secrets**
   - Check `JWT_SECRET` in `.env`
   - Restart application after modification

4. **Malformed JWT token**
   - Verify it has 3 parts separated by dots
   - No spaces or special characters

### Error 403 Forbidden

**Cause:** Insufficient permissions

```bash
# Check user role
curl -X GET "${API_BASE_URL}/admin/whoami" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

**Solution:** Use an ADMIN account for CREATE/UPDATE/DELETE operations

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If stopped, start it
brew services start mongodb-community

# Verify connection
mongosh mongodb://localhost:27017/universite
```

### Port 3000 already in use

```bash
# Find the process
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=3001
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Code coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 📖 Academic Projects

Documentation for different academic projects:

1. **Prosit 2** — NestJS Basics (Controllers, Services, Modules, DTO)
   - [📄 Documentation](./prosites/Prosit%202.pdf)

2. **Prosit 3** — MongoDB Integration, Mongoose, ConfigModule
   - [📄 Documentation](./prosites/Prosit3.pdf)

3. **Prosit 4** — JWT Authentication, RBAC, Guards, Mongoose
   - [📄 Documentation](./prosites/Prosit4.docx)

4. **Prosit 5** — Refresh Tokens, Sessions, Swagger
   - Features integrated in this project

---

## 📜 Useful Scripts

```bash
# Development
npm run start:dev        # Watch mode with hot-reload
npm run start:debug      # Debug mode

# Production
npm run build            # Compile TypeScript → JavaScript
npm run start:prod       # Start in production mode

# Code Quality
npm run format           # Format code with Prettier
npm run lint             # Check with ESLint
npm run lint -- --fix    # Auto-fix issues

# Testing
npm run test             # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Coverage report
```

---

## 👨‍💻 About

### Academic Project

Project completed as part of the **4th year SIM** curriculum at [ESPRIT](https://www.esprit.tn/) — Private Higher School of Engineering and Technologies.

### Author

**Karim Feki**  
Computer & Mobile Systems Engineering Student

- 📧 Email: [feki.karim28@gmail.com](mailto:feki.karim28@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/karimfeki](https://www.linkedin.com/in/karimfeki/)
- 🐙 GitHub: [github.com/fekikarim](https://github.com/fekikarim)

---

## 🙏 Acknowledgments

- The NestJS team for the exceptional framework
- The MongoDB community for Mongoose
- ESPRIT teachers and administration

---

**Version:** 1.0.0  
**Last Updated:** October 2025

[![Made with NestJS](https://img.shields.io/badge/Made%20with-NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
