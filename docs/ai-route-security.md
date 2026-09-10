# AI route deployment modes

Koe protects the chat, grammar, content, writing, and grade API routes through
one shared guard. Choose the deployment mode explicitly.

## Local mode

Development and tests default to AI_ROUTE_MODE=local. Local mode has no app
login and is intended only for one user on the same machine. It accepts JSON
POSTs only through a loopback URL and rejects foreign browser origins and
cross-site fetches.

Production does not choose a mode automatically. To run a production build
locally, set AI_ROUTE_MODE=local and AI_ALLOW_LOCAL_PRODUCTION=true. Bind
Next.js to loopback with pnpm start --hostname 127.0.0.1.

Keep that listener behind the host firewall or a private tunnel. Do not bind
local mode to 0.0.0.0 or expose it directly to a LAN or the internet.

## Hosted mode

Hosted mode expects an external login service or authenticated gateway. That
service owns sign-in and issues short-lived JWTs. Koe validates the JWT and
does not trust X-Forwarded-For, a user ID header, or any other unsigned
identity header.

Required settings are:

- AI_ROUTE_MODE=hosted
- AI_AUTH_JWKS_URL=https://login.example.com/.well-known/jwks.json
- AI_AUTH_ISSUER=https://login.example.com
- AI_AUTH_AUDIENCE=koe
- AI_PUBLIC_ORIGIN=https://koe.example.com
- AI_AUTH_COOKIE=koe_session
- AI_LIMIT_SUBJECT_SECRET: a stable random secret of at least 32 characters
- DATABASE_URL: the shared Postgres connection URL

The JWT must use RS256 or ES256 and contain:

- sub: a stable, nonempty user identifier
- iss: the exact AI_AUTH_ISSUER string
- aud: AI_AUTH_AUDIENCE
- exp: a future expiration time
- scope: a space-separated string or string array containing ai:invoke

API clients may send Authorization: Bearer followed by the JWT. For the
existing browser UI, the login gateway should set the configured cookie on
the Koe origin with HttpOnly, Secure, and SameSite=Lax or SameSite=Strict.
Cookie requests must also carry an Origin header exactly equal to
AI_PUBLIC_ORIGIN. A request that presents both bearer and cookie credentials
must authenticate both as the same subject.

Before enabling hosted mode, run pnpm db:push to create the
ai_route_budgets table. Hosted mode has no memory fallback. Missing auth
configuration, database configuration, or quota table fails closed before
provider lookup. Applying the schema is a deployment step; the test suite
uses embedded PGlite and does not contact or modify a hosted database.

## Resource limits

The guard reads and counts the request stream, so a missing or false
Content-Length cannot bypass the 64 KiB body limit. Route schemas cap prompt
fields and chat history. Every provider request has a 30 second deadline,
zero automatic retries, and an output token cap.

Hosted budgets are shared in Postgres across all five routes and all app
processes. Each user receives 30 requests per 10 minute fixed window and one
concurrent request. A 35 second expiring lease recovers capacity after a
process crash. Cancellation, response completion, provider errors, and
timeouts release the matching lease; an old release cannot clear a newer
lease.

Public failures use fixed messages and status codes: 400 for invalid fields,
401 or 403 for authentication and authorization, 413 for large bodies, 415
for non-JSON bodies, 429 for exhausted capacity, 503 for unavailable
configuration, storage, or providers, and 504 for deadlines. Provider errors,
credentials, tokens, and database details are not included in responses.
