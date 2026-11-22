# School Money

School Money is a web application built with **React**, **Spring Boot**, **PostgreSQL**, **Nginx**, and **Docker**.

## Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS 4.3
* **Backend:** Java 25, Spring Boot 4.1, JWT
* **Database:** PostgreSQL
* **Infrastructure:** Docker, Docker Compose, Nginx

## Getting Started

### 1. Environment

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

### 2. Run the application

Start the application:

```bash
docker compose up
```

Stop the application:

```bash
docker compose down
```

To also remove Docker volumes:

```bash
docker compose down -v
```

> `docker compose down -v` will remove the local database data.

## URLs

After starting the application:

* **Frontend:** `localhost`
* **Backend API:** `localhost/api`
* **Swagger:** `localhost/api/swagger`


### Backend

Backend should be organized by functionality/module to keep everything nice and clean:

```text
backend/
├── core/
│   ├── config/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
│       ├── request/
│       └── response/
│   ├── exception/
│   ├── mapper/
│   └── util/
│
├── auth/
│   ├── config/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── dto/
│   ├── exception/
│   ├── mapper/
│   └── util/
│
└── ...
```

Keep functionality-specific code inside its module. For example, authentication-related code should stay inside `auth`.

## Timezone

Backend and database use UTC timezone, every conversion to local datetime should be done on frontend, all endpoints should accept and return UTC.

## Development

When adding API endpoints:

* use proper request/response DTOs,
* use explicit Java types,

Swagger is available at:

```text
http://localhost/api/swagger
```

and should be used to test and verify API endpoints during development.

## Authentication

Authentication uses JWT tokens. Roles: `USER` and `ADMIN`.

| Endpoint | Auth | Description |
|---|---|---|
| `POST /auth/register` | public | `{ email, firstName, lastName, password }`, always creates a `USER` account |
| `POST /auth/login` | public | `{ email, password }`, returns `accessToken` |
| `GET /auth/me` | token | currently logged in user |

Every other endpoint requires the header `Authorization: Bearer <accessToken>`, in Swagger use the **Authorize** button.
Endpoints under `/admin/**` require the `ADMIN` role, for single endpoints use `@PreAuthorize("hasRole('ADMIN')")`.
Logged in user is available in controllers with `@AuthenticationPrincipal AuthenticatedUser user`.

The admin account is created on application startup from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (see `.env.example`).

## Frontend

The frontend uses **TypeScript**, **Tailwind CSS 4.3**, and **Prettier**.

Prettier is configured to use **2 spaces** for indentation.
