# BookVerse Web

Small, production-like UI for the BookVerse demo. It consumes the microservice
APIs and is designed to demonstrate end-to-end CI/CD and promotion with
JFrog AppTrust.

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

## CI/CD

- The web workflow builds static assets, uploads an artifacts tarball to a
  generic repository, builds a Docker image, and publishes build-info.
- Promotion workflow promotes the application version and attaches evidence.

### Required repository variables

- `PROJECT_KEY`: `bookverse`
- `DOCKER_REGISTRY`: Artifactory Docker registry hostname
- `JFROG_URL`: JFrog platform base URL

### Required repository secrets

- `JFROG_ACCESS_TOKEN`: Access token used by CI to interact with JFrog Platform
- `EVIDENCE_PRIVATE_KEY`: Private key PEM for evidence signing (mandatory)
