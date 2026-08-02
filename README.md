# Passwordless Bank Auth

This repository contains a clean microservices skeleton for a passwordless banking authentication platform.

## Project structure
- auth-service: Spring Boot service for authentication-related APIs and domain scaffolding
- banking-service: Spring Boot service for account and banking domain scaffolding
- api-gateway: Spring Cloud Gateway entrypoint with placeholder routes
- faceid-service: FastAPI service with a simple health endpoint

## Included files
- Maven-based Spring Boot service skeletons
- Dockerfiles and Docker Compose wiring
- PostgreSQL initialization SQL
- Environment example file and root README

## Getting started
1. Copy [.env.example](.env.example) to `.env` and adjust values if needed.
2. Start the infrastructure and services with Docker Compose:
   - `docker compose up --build`
3. Explore the service entrypoints:
   - Auth service: http://localhost:8081/auth/health
   - Banking service: http://localhost:8082/actuator/health (if actuator is added later)
   - Gateway: http://localhost:8080
   - FaceID service: http://localhost:8000/health

## Notes
No business logic, controllers, repositories, or authentication flow implementation has been added yet. The scaffold is intentionally minimal and production-ready in structure.
