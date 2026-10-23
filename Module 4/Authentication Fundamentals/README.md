# Authentication Fundamentals

## Setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm start
```

The SQLite datasource keeps local setup self-contained. Do not commit `.env` or `prisma/dev.db`.

## Endpoints

- `POST /auth/register` accepts `{ "name": "Sam", "email": "sam@example.com", "password": "your password" }`. Passwords are stored only as asynchronous bcrypt hashes. Success returns 201 with safe user fields.
- `POST /auth/login` accepts `{ "email": "sam@example.com", "password": "your password" }`. Success returns safe user fields; unknown email and incorrect password return the same generic 401 response.

Malformed input returns 400 and duplicate normalized email returns 409. No JWT or session is implemented.
