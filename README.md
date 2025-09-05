# BookVerse Web

Minimal UI for the BookVerse demo.

## Local dev
```
npm install
npm run dev
```

## Build
```
npm run build
```

## Docker
```
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

## CI/CD
- CI builds the site, generates SBOM (placeholder), signs (placeholder), builds image, and pushes to `${PROJECT_KEY}-web-docker-internal-local`.
- Promote workflow copies/tags to release repo on PROD.

### Required repository variables

- `PROJECT_KEY`: `bookverse`
- `DOCKER_REGISTRY`: e.g., `releases.jfrog.io`
- `JFROG_URL`: e.g., `https://releases.jfrog.io`

### Required repository secrets

- `JFROG_ACCESS_TOKEN`: Access token used by CI to interact with JFrog Platform
- `EVIDENCE_PRIVATE_KEY`: Private key PEM for evidence signing (mandatory)
