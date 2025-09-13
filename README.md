# BookVerse Web

Small, production-like UI for the BookVerse demo. It consumes the microservice
APIs and is designed to demonstrate end-to-end CI/CD and promotion with
JFrog AppTrust.

## Testing Status
- Testing automatic CI triggers with Docker image + web assets
- Validating commit filtering, application version creation, and auto-promotion

## Local development

```bash
npm install
npm run dev
```

The dev server runs with Vite and expects the backend base URLs to be provided
via environment variables (see Docker section) or defaults from `src/services`.

## Build

```bash
npm run build
```

Artifacts are emitted to `dist/`.

## Docker

```bash
# build
docker build -t bookverse-web:dev .
# run with runtime config
docker run -p 8080:8080 \
  -e BOOKVERSE_ENV=DEV \
  -e INVENTORY_BASE_URL=http://inventory \
  -e RECOMMENDATIONS_BASE_URL=http://recommendations \
  -e CHECKOUT_BASE_URL=http://checkout \
  bookverse-web:dev
```

## Configuration

- `BOOKVERSE_ENV`: logical environment label (e.g., DEV/QA/STAGING/PROD)
- `INVENTORY_BASE_URL`: backend inventory base URL
- `RECOMMENDATIONS_BASE_URL`: backend recommendations base URL
- `CHECKOUT_BASE_URL`: backend checkout base URL

### Environment Variable Substitution

The `entrypoint.sh` script performs runtime environment variable substitution in the `config.js` file. This allows the web application to connect to different backend services based on the deployment environment.

**Important**: The heredoc in `entrypoint.sh` must NOT use single quotes (`<<'CFG'`) as this prevents shell variable expansion. Use `<<CFG` instead to enable proper substitution.

### Backend URL Configuration

**Production/Kubernetes**: Use internal service names
```bash
INVENTORY_BASE_URL=http://inventory
RECOMMENDATIONS_BASE_URL=http://recommendations  
CHECKOUT_BASE_URL=http://checkout
```

**Local Development**: Use localhost with port-forwarding
```bash
INVENTORY_BASE_URL=http://localhost:8001
RECOMMENDATIONS_BASE_URL=http://localhost:8003
CHECKOUT_BASE_URL=http://localhost:8002
```

## CI/CD

- The web workflow builds static assets, uploads an artifacts tarball to a
  generic repository, builds a Docker image, and publishes build-info.
- Promotion workflow promotes the application version and attaches evidence.

### Required repository variables

- `PROJECT_KEY`: `bookverse`
- `DOCKER_REGISTRY`: Artifactory Docker registry hostname
- `JFROG_URL`: JFrog platform base URL

### Required repository secrets

- `EVIDENCE_PRIVATE_KEY`: Private key PEM for evidence signing (mandatory)

### Mandatory OIDC application binding (.jfrog/config.yml)

This repository must include a committed, non-sensitive `.jfrog/config.yml` declaring the AppTrust application key. This is mandatory for package binding.

- During an OIDC-authenticated CI session, JFrog CLI reads the key so packages uploaded by the workflow are automatically bound to the correct AppTrust application.
- Contains no secrets and must be versioned. If the key changes, commit the update.

Path: `bookverse-web/.jfrog/config.yml`

Example:

```yaml
application:
  key: "bookverse-web"
```

## Workflows

- [`ci.yml`](.github/workflows/ci.yml) — CI for the web app: build, package static assets, Docker image, publish artifacts/build-info.
- [`promote.yml`](.github/workflows/promote.yml) — Promote the web application version through stages with evidence.
- [`promotion-rollback.yml`](.github/workflows/promotion-rollback.yml) — Roll back a promoted web application version (demo utility).
