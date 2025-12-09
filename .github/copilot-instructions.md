This repository contains a Spring Boot backend (Java 21, Maven) and a Vite + React frontend.

Quick summary (big picture)
- Backend: `sgturnos/` — Spring Boot app (Java 21). Entry: `SgturnosApplication.java`. Build with the included Maven wrapper (`mvnw`/`mvnw.cmd`).
- Frontend: `sgturnos-react-app/` — Vite + React (ESM). Entry: `src/main.jsx` and `src/App.jsx`.
- Integration: Frontend calls backend at `http://localhost:8085/api` (see `sgturnos-react-app/src/api.js`).

Essential files to inspect
- `sgturnos/src/main/java/com/sgturnos/config/SecurityConfig.java` — JWT + CORS rules, public endpoints (note: `/api/usuarios/**` and `/api/mallas/**` are currently permitted).
- `sgturnos/src/main/java/com/sgturnos/controller/AuthController.java` — `/api/auth` endpoints (`/login`, `/register`). Login returns JSON `{ accessToken: "..." }`.
- `sgturnos/src/main/java/com/sgturnos/security/JwtTokenProvider.java` and `JwtAuthenticationFilter.java` — token creation/validation and request filtering.
- `sgturnos/src/main/resources/application.properties` — runtime properties: server port, DB URL and `jwt.secret` (Base64-encoded). Also `malla.storage.path` for generated mallas.
- `sgturnos/pom.xml` — Java dependencies and plugin (Spring Boot Maven plugin).
- `sgturnos-react-app/package.json` and `sgturnos-react-app/src/api.js` — frontend scripts and API client behavior.

Developer workflows (how to run & debug locally)
- Backend (Windows PowerShell, from repo root):
``powershell
# build
cd sgturnos; .\mvnw.cmd -DskipTests package
# run (dev)
cd sgturnos; .\mvnw.cmd spring-boot:run
# run tests
cd sgturnos; .\mvnw.cmd test
``
- Frontend (PowerShell, from repo root):
``powershell
cd sgturnos-react-app; npm install
cd sgturnos-react-app; npm run dev        # starts Vite on 5173
cd sgturnos-react-app; npm run build      # production build
``
- Typical local development: run backend (port 8085) and frontend (5173). CORS is configured in `SecurityConfig` to allow `http://localhost:5173`.

Auth and API flow (concrete examples)
- Login: POST `/api/auth/login` with { email, password } returns `{ accessToken }`.
- Frontend stores token as `localStorage.setItem('token', accessToken)` (see `LoginForm.jsx`) and the axios instance in `src/api.js` automatically sends `Authorization: Bearer <token>`.
- Protected routes are enforced by `JwtAuthenticationFilter`; if you need to debug auth, check `JwtTokenProvider` and `application.properties` for `jwt.secret`.

Project-specific conventions and gotchas
- Language and comments are primarily Spanish — keep that in mind when searching for intent or TODOs.
- JWT secret is stored in `application.properties` as Base64 (`jwt.secret`). The code decodes it (`JwtTokenProvider`) — do not replace blindly; use Base64-encoded secrets.
- SecurityConfig currently permits `/api/usuarios/**` and `/api/mallas/**` (explicitly permitted in the code). Treat this as intentional for local testing; do not assume production-level restrictions.
- Mallas files are written to disk under `malla.storage.path` (default `./mallas`) — paths are relative to project root.
- The backend uses Lombok and JPA repositories in the usual Spring packages: `model`, `repository`, `service`, `controller`, `dto` — follow existing structure for new code.

Where to look for changes you might need to make
- If you change ports, update `sgturnos-react-app/src/api.js` baseURL or use environment variables in Vite.
- To change CORS allowed origins, edit `SecurityConfig.corsConfigurationSource()`.
- To adjust token lifetime or secret handling, inspect `JwtTokenProvider.java`.

Quick tips for an AI coding agent
- Cite exact files when proposing edits (e.g., "update `SecurityConfig.java` to restrict `/api/usuarios/**`").
- When suggesting config changes, show both the code snippet and the exact file path to edit.
- Prefer non-invasive changes (feature flags, environment variables) before altering auth rules.
- For frontend fixes, check `sgturnos-react-app/src/api.js`, `LoginForm.jsx` and `package.json` scripts first.

If anything above is unclear or you'd like this file in Spanish, or to include CI/CD (Azure/GH Actions) steps, tell me which sections to expand and I will iterate.

References (examples to open first)
- `sgturnos/src/main/java/com/sgturnos/config/SecurityConfig.java`
- `sgturnos/src/main/java/com/sgturnos/controller/AuthController.java`
- `sgturnos/src/main/java/com/sgturnos/security/JwtTokenProvider.java`
- `sgturnos/src/main/resources/application.properties`
- `sgturnos-react-app/src/api.js`
- `sgturnos-react-app/package.json`
