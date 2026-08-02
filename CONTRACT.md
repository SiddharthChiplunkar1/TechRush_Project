# Passwordless Bank API Contract

## Shared JWT contract

Every service must trust the following claims:

- `sub`: user email
- `userId`: numeric user id
- `tokenVersion`: integer, incremented on logout-all
- `role`: `USER` or `ADMIN`
- `authLevel`: `STRONG` or `WEAK`
- `type`: `access` or `refresh`
- `exp` / `iat`: standard JWT timestamps

Signing:
- HMAC-SHA256
- one shared secret from the root `.env` file

TTL:
- Access token: 15 minutes
- Refresh token: 7 days

## Token revocation policy

This starter repo uses a simple approach:
- `auth-service` validates `tokenVersion` against its own user record
- other services trust the claim for the MVP and do not independently check DB state

## Service boundary DTOs

### Auth service -> banking service
- Required claims: `userId`, `authLevel`
- No other banking-specific claims are required for MVP

### Auth service -> faceid service
- Request: `{ "userId": 123, "imageBase64": "..." }`
- Response: `{ "match": true, "live": true, "confidence": 0.92 }`

### Error responses
- Use a simple shape everywhere: `{ "message": "..." }`

## Repo conventions

- Monorepo with one folder per service
- `main` stays buildable
- `docker compose up --build` is the integration check
- Local development should be possible per service with a simple run command
