# TradEon CRM

Enterprise CRM for B2B automotive trading (Spain / Europe).

| Layer    | Technology                     |
|----------|-------------------------------|
| Backend  | NestJS 10 + Fastify            |
| Database | PostgreSQL 16                  |
| ORM      | Prisma 5                       |
| Frontend | Next.js 14 (App Router)        |
| Styling  | Tailwind CSS 3                 |
| Monorepo | pnpm workspaces + Turborepo 2  |

---

## Prerequisites

| Tool       | Minimum version |
|------------|-----------------|
| Node.js    | 20.x            |
| pnpm       | 9.x             |
| Docker     | 24.x            |
| Docker Compose | v2 (`docker compose`) |

Install pnpm if you don't have it:

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

---

## Quick start (local dev)

### 1 — Clone and install

```bash
git clone <repo-url> tradeon-crm
cd tradeon-crm
pnpm install
```

### 2 — Environment variables

```bash
# Root / shared
cp .env.example .env

# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local
```

### 3 — Start the database

```bash
docker compose up -d postgres
```

### 4 — Run Prisma migrations

```bash
pnpm db:migrate        # runs prisma migrate dev
pnpm db:generate       # generates Prisma client
```

### 5 — Start the dev servers

```bash
pnpm dev               # starts both api (3001) and web (3000) via Turborepo
```

| Service | URL                          |
|---------|------------------------------|
| Web     | http://localhost:3000        |
| API     | http://localhost:3001/api    |
| Health  | http://localhost:3001/api/health |
| Prisma Studio | `pnpm db:studio`     |

---

## Docker (full stack)

To run everything in containers, uncomment the `api` and `web` services in `docker-compose.yml`, then:

```bash
docker compose up --build
```

---

## Project structure

```
tradeon-crm/
├── apps/
│   ├── api/                   # NestJS backend
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   ├── src/
│   │   │   ├── config/        # Environment config factory
│   │   │   ├── health/        # /health endpoint (Terminus)
│   │   │   ├── prisma/        # PrismaService + PrismaModule
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── Dockerfile
│   └── web/                   # Next.js 14 frontend
│       ├── src/app/           # App Router pages & layouts
│       └── Dockerfile
├── packages/
│   └── shared/                # Shared TypeScript types (ApiResponse, etc.)
├── docker-compose.yml         # Local dev infra (Postgres, Redis)
├── turbo.json                 # Turborepo task pipeline
├── pnpm-workspace.yaml
└── .env.example
```

---

## Scripts reference

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `pnpm dev`            | Start all apps in watch mode         |
| `pnpm build`          | Build all apps                       |
| `pnpm lint`           | Lint all apps                        |
| `pnpm type-check`     | TypeScript check all apps            |
| `pnpm db:migrate`     | Run Prisma migrations (dev)          |
| `pnpm db:generate`    | Regenerate Prisma client             |
| `pnpm db:studio`      | Open Prisma Studio                   |

---

## Environment variables

See `.env.example` for the full list. Key variables:

| Variable              | Default                              | Notes                     |
|-----------------------|--------------------------------------|---------------------------|
| `DATABASE_URL`        | `postgresql://tradeon:tradeon_dev@localhost:5432/tradeon_crm` | Prisma connection string |
| `API_PORT`            | `3001`                               |                           |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api`          | Must be `NEXT_PUBLIC_` prefix |

---

## Authentication

The API uses JWT access tokens (15 min) + refresh tokens (7 days) with SHA-256-hashed storage for revocation.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/login` | — | Issue access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | — | Rotate refresh token, issue new pair |
| `POST` | `/api/v1/auth/logout` | Bearer | Invalidate refresh token |
| `GET` | `/api/v1/auth/me` | Bearer | Return current user profile |

### Roles

| Role | Intended access |
|------|----------------|
| `admin` | Full CRM access, user management |
| `sales` | Companies, contacts, deals |
| `finance` | Invoices, credit limits, balances |
| `support` | Read-only companies and deals |

### Example flow (curl)

```bash
# 1. Log in — get tokens
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@tradeon.es","password":"Admin1234!"}' | jq

# Response
# {
#   "accessToken": "<jwt>",
#   "refreshToken": "<jwt>"
# }

# 2. Call a protected endpoint
curl -s http://localhost:3001/api/v1/auth/me \
  -H 'Authorization: Bearer <accessToken>' | jq

# 3. Refresh when the access token expires
curl -s -X POST http://localhost:3001/api/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refreshToken>"}' | jq

# 4. Log out (invalidates the refresh token)
curl -s -X POST http://localhost:3001/api/v1/auth/logout \
  -H 'Authorization: Bearer <accessToken>'
```

### Seeded credentials (development only)

| Email | Password | Role |
|-------|----------|------|
| `admin@tradeon.es` | `Admin1234!` | `admin` |
| `kenan.pektas@tradeon.es` | `TradEon2026!` | `sales` |
| `laura.garcia@tradeon.es` | `TradEon2026!` | `sales` |
| `david.santos@tradeon.es` | `TradEon2026!` | `finance` |
| `martin.zimmermann@tradeon.es` | `TradEon2026!` | `sales` |

### Protecting a route

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard }   from '../auth/guards/roles.guard';
import { Roles }         from '../auth/decorators/roles.decorator';
import { CurrentUser }   from '../auth/decorators/current-user.decorator';
import { Role }          from '@prisma/client';

@Get('sensitive')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.finance)          // only admin and finance may access
getSensitiveData(@CurrentUser() user: { sub: string; email: string; role: Role }) {
  return { userId: user.sub };
}
```

### Generating strong secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`.

---

## Next steps

1. **Domain modules** — create NestJS feature modules (`CompanyModule`, `ContactModule`, …) and corresponding Next.js route groups
2. **Redis** — uncomment Redis in `docker-compose.yml` and add caching layer
3. **Swagger** — add `@nestjs/swagger` for API documentation
