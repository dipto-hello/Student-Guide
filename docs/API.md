# API Reference

Base URL: `/api`

All responses are JSON. All requests and responses carry cookies — the client
must send `credentials: 'include'` (the shared client in
[`client/src/lib/api.ts`](../client/src/lib/api.ts) does this for you).

---

## Authentication

Auth uses a signed JWT in an `httpOnly` cookie named `auth_token`, valid for 30
days. There is no bearer-token flow — the cookie is set by the server and read
back on each request.

### CSRF

Because auth rides on a cookie with `SameSite=None` (required for the
Vercel → Render split origin), every **state-changing** request must carry a
CSRF token:

1. The server issues a readable cookie `csrf_token` on any `/api` response.
2. The client echoes it in the `X-CSRF-Token` header.
3. The server rejects the request with `403` if the two do not match.

`GET`, `HEAD`, and `OPTIONS` are exempt. `POST /api/auth/google` is also exempt —
the caller has no session yet, and its CSRF resistance comes from the
Google-issued ID token.

### Rate limits

| Scope | Window | Limit |
| --- | --- | --- |
| All `/api` | 15 min | 300 requests |
| `/api/auth/*` | 15 min | 20 requests |
| Any non-`GET` | 1 min | 60 requests |

Authenticated requests are keyed by user id, anonymous ones by IP, so users on a
shared campus network do not exhaust each other's budget. Exceeding a limit
returns `429` with `{ "error": "..." }`.

### Common error shape

```json
{ "error": "Human-readable message", "requestId": "uuid" }
```

Validation failures add a `details` array from Zod:

```json
{ "error": "Invalid input", "details": [{ "path": ["name"], "message": "..." }] }
```

| Status | Meaning |
| --- | --- |
| `400` | Request body failed validation |
| `401` | Missing or invalid `auth_token` |
| `403` | Authenticated but not permitted, or CSRF token mismatch |
| `404` | Resource does not exist |
| `429` | Rate limit exceeded |
| `500` | Unhandled server error (message is generic in production) |

---

## Health

### `GET /api/health`

Liveness probe. Never rate limited.

```json
{ "status": "ok", "uptime": 1234.5 }
```

### `GET /api/health/ready`

Readiness probe — runs a trivial query against the database.
Returns `200 {"status":"ready"}` or `503 {"status":"unavailable"}`.

---

## Auth — `/api/auth`

### `GET /api/auth/google`

Starts the server-side OAuth 2.0 authorization-code flow. Generates a random
`state` parameter and PKCE values, stores them in a short-lived httpOnly
`oauth_state` cookie, and redirects (302) to Google's consent screen.

The client initiates sign-in by navigating to this endpoint (e.g., via
`window.location.href = '/api/auth/google'` or an anchor tag).

**Response `302`** — redirects to `https://accounts.google.com/o/oauth2/v2/auth`
with the OAuth parameters. Also sets the `oauth_state` cookie.

### `GET /api/auth/google/callback`

Handles the OAuth redirect from Google. Verifies the `state` and `oauth_state`
cookie, exchanges the authorization code for tokens using the client secret,
verifies the ID token, upserts the user, sets the `auth_token` session cookie,
and redirects back to the SPA.

**Query params** (set by Google)

| Field | Type | Notes |
| --- | --- | --- |
| `code` | string | Authorization code |
| `state` | string | Must match the `oauth_state` cookie |

**Response `302` (success)** — redirects to `CLIENT_URL` with the `auth_token`
cookie set.

**Response `302` (error)** — redirects to `CLIENT_URL/?auth_error=<reason>`.
Reasons: `oauth_not_configured`, `access_denied`, `invalid_request`,
`state_mismatch`, `no_id_token`, `email_unverified`, `exchange_failed`.

### `POST /api/auth/google`

**Deprecated but still supported for backward compatibility.** Exchanges a Google
ID token for a session. Creates the user on first sign-in and links `googleId`
to an existing account matched by email.

New integrations should use the server-side flow (`GET /api/auth/google` →
callback) instead of the client-side widget.

**Body**

| Field | Type | Notes |
| --- | --- | --- |
| `credential` | string | ID token from Google Identity Services (client-side widget) |

**Response `200`** — also sets the `auth_token` cookie.

```json
{
  "user": {
    "id": "usr_...",
    "name": "Dipto Sarker",
    "email": "user@example.com",
    "avatarUrl": "https://...",
    "provider": "google",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "isAdmin": false
  }
}
```

`isAdmin` is derived server-side from `ADMIN_EMAIL`. Treat it as a UI hint only —
every admin route re-checks authorization independently.

### `GET /api/auth/me`

Returns the current user, or `{"user": null}` when there is no valid session.
Never returns `401` — a signed-out visitor is a normal case, not an error.

### `POST /api/auth/logout`

Clears the `auth_token` cookie. Always `200`.

---

## User — `/api/user`

All routes require authentication and operate only on the caller's own rows.

### Courses

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/user/courses` | List the caller's courses |
| `POST` | `/api/user/courses` | Create a course |
| `PATCH` | `/api/user/courses/:id` | Partial update |
| `DELETE` | `/api/user/courses/:id` | Delete one course |
| `DELETE` | `/api/user/courses` | Delete all of the caller's courses |

**Course body**

| Field | Type | Constraints |
| --- | --- | --- |
| `name` | string | 2–100 chars |
| `creditHours` | number | positive integer |
| `grade` | number | `0`–`4.0` |

`POST` responds `201` with the created row, including its generated `id`.
`PATCH` accepts any subset of the fields.

### Typing scores

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/user/typing-score` | Record a test result |
| `GET` | `/api/user/typing-history` | Ten most recent results, newest first |

**Body**

| Field | Type | Constraints |
| --- | --- | --- |
| `wpm` | number | ≥ 0 |
| `accuracy` | number | `0`–`100` |
| `difficulty` | string | `easy` \| `medium` \| `hard` |

### Study sessions

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/user/study-session` | Record a completed session |
| `GET` | `/api/user/study-sessions` | Twenty most recent, newest first |

**Body**

| Field | Type | Constraints |
| --- | --- | --- |
| `type` | string | 2–50 chars (e.g. `focus`, `break`) |
| `durationMinutes` | number | positive integer, ≤ 1440 |

### Streaks and achievements

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/user/streak` | Current streak, longest streak, achievements |
| `POST` | `/api/user/streak/activity` | Record activity for today (idempotent per day) |
| `POST` | `/api/user/streak/achievement` | Unlock an achievement (idempotent) |

`GET` returns zeroed defaults rather than `404` for a user with no streak row:

```json
{ "currentStreak": 0, "longestStreak": 0, "lastActiveDate": "", "achievements": [] }
```

`achievementId` must match `^[a-z0-9_-]+$` and be at most 64 characters.

### Profile and account

| Method | Path | Description |
| --- | --- | --- |
| `PUT` | `/api/user/profile` | Update display name (2–80 chars) |
| `DELETE` | `/api/user/account` | Delete the account and all associated data |

`DELETE` removes every child row and clears the auth cookie. It is irreversible.

---

## Notifications — `/api/notifications`

Requires authentication.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/notifications` | Fifty most recent, newest first |
| `PUT` | `/api/notifications/:id/read` | Mark one as read |
| `PUT` | `/api/notifications/read-all` | Mark all as read |

```json
[
  {
    "id": "notif_...",
    "type": "info",
    "message": "Welcome!",
    "isRead": false,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

## Search — `/api/search`

### `GET /api/search?q=<query>`

Case-insensitive search over the static tool catalogue. Public — no auth
required. An empty `q` returns `[]`. Results are cached for 5 minutes.

| Param | Type | Constraints |
| --- | --- | --- |
| `q` | string | ≤ 100 chars |

```json
[{ "id": "cgpa", "title": "CGPA Calculator", "path": "/", "icon": "Calculator", "type": "tool" }]
```

---

## Admin — `/api/admin`

Every route requires an authenticated user whose email matches `ADMIN_EMAIL`.
Authorization is decided server-side from the verified JWT; a client-side
`isAdmin` flag grants nothing. Non-admins receive `403`.

### `GET /api/admin/stats`

```json
{ "totalUsers": 0, "totalStudySessions": 0, "totalCourses": 0, "avgTypingSpeed": 0 }
```

### `GET /api/admin/users`

All users, newest first. Never includes `passwordHash` or `googleId`.

### `POST /api/admin/broadcast`

Creates a notification for every user.

| Field | Type | Constraints |
| --- | --- | --- |
| `message` | string | 1–500 chars |
| `type` | string | `info` \| `success` \| `warning` \| `error` (default `info`) |

Responds `{ "success": true, "count": 42 }`.

### `DELETE /api/admin/users/:userId`

Deletes a user and cascades to all their data. Returns `400` if the target is the
admin account, `404` if no such user exists.

---

## WebSocket

Socket.io on the same origin as the API. Connections authenticate from the same
`auth_token` cookie; an unauthenticated socket is rejected at handshake.

Each socket is capped at 60 events per 10 seconds.

**Client → server**

| Event | Payload | Description |
| --- | --- | --- |
| `join_study_room` | — | Join the shared study room |
| `leave_study_room` | — | Leave it |
| `sync_timer` | `{ timeLeft: number, status: string }` | Broadcast timer state to the room |

**Server → client**

| Event | Payload |
| --- | --- |
| `user_joined` | `{ userId }` |
| `user_left` | `{ userId }` |
| `room_stats` | `{ activeUsers: number }` |
| `timer_update` | `{ userId, timeLeft, status }` |
| `new_notification` | Notification object |

`sync_timer` payloads are validated server-side; malformed events are dropped
rather than relayed.
