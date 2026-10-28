# LU48 — Cookies, Sessions and Authentication

## Setup

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Set `COOKIE_SECRET` in `.env` to at least 32 random characters. Use
`COOKIE_SECURE=false` for local HTTP development. Set it to `true` in production
when serving the API over HTTPS. Never commit your real `.env` file.

Seeded demo account: `sam@example.com` / `SessionDemo!48`.

## Endpoints

- `POST /auth/login` — accepts JSON `{ "email": "...", "password": "..." }`,
  compares the password with bcrypt, creates a server-side session, and sets a
  signed, HttpOnly `sid` cookie. Invalid credentials return the same generic 401.
- `GET /auth/me` — validates the signed cookie and server-side session, then
  returns only the user's id, name, and email.
- `POST /auth/logout` — destroys the server-side session and clears the cookie.

The cookie uses `sameSite: "lax"`, `httpOnly: true`, and `secure` according to
`COOKIE_SECURE`. The opaque session ID maps to `{ userId, expiresAt }` in the
server-side session store; passwords and password hashes are never stored in
sessions. Expired sessions are removed when read.

The starter uses an in-memory session store for this exercise, so sessions are
cleared when the Node process restarts. A multi-instance production deployment
should use a shared persistent session store.

## Try it with curl

Login and save the cookie:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"sam@example.com","password":"SessionDemo!48"}' \
  http://localhost:3000/auth/login
```

Check the current user:

```bash
curl -i -b cookies.txt http://localhost:3000/auth/me
```

Logout:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
```
