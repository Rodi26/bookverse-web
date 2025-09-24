# BookVerse Web Frontend

Demo-ready Vue.js frontend application for the BookVerse platform, showcasing JFrog AppTrust capabilities with static asset deployment patterns.

## 🎯 Demo Purpose & Patterns

This service demonstrates the **Static Asset Application Pattern** - showcasing how frontend applications with build artifacts, static assets, and CDN deployments can be managed in AppTrust.

### 🌐 **Static Asset Application Pattern**
- **What it demonstrates**: Application versions built from static assets (HTML, CSS, JS bundles) with containerized delivery
- **AppTrust benefit**: Frontend builds with all assets promoted together ensuring UI consistency across environments (DEV → QA → STAGING → PROD)
- **Real-world applicability**: Modern SPA applications, static sites, and frontend microservices

This service is **frontend-focused** - it demonstrates how modern web applications can be reliably built and promoted through enterprise pipelines.

## 🏗️ Web Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  BookVerse Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                      │
│                    │   Web Frontend  │                      │
│                    │                 │                      │
│                    │ Static Assets + │                      │
│                    │ Container       │                      │
│                    │ ┌─────────────┐ │                      │
│                    │ │ Vue.js SPA  │ │                      │
│                    │ │    Build    │ │                      │
│                    │ └─────────────┘ │                      │
│                    │ ┌─────────────┐ │                      │
│                    │ │   Nginx     │ │                      │
│                    │ │  Container  │ │                      │
│                    │ └─────────────┘ │                      │
│                    └─────────────────┘                      │
│                    │       │       │                        │
│          ┌─────────┘       │       └─────────┐              │
│          │                 │                 │              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│  │   Inventory   │ │   Checkout    │ │Recommendations│      │
│  │    Service    │ │    Service    │ │    Service    │      │
│  └───────────────┘ └───────────────┘ └───────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

AppTrust Promotion Pipeline:
DEV → QA → STAGING → PROD
 │     │       │        │
 └─────┴───────┴────────┘
   Static Assets + Container
   Move Together as Version
```

## 🔧 JFrog AppTrust Integration

This service creates multiple artifacts per application version:

1. **Docker Images** - Nginx container serving static assets
2. **Static Assets** - Built JavaScript, CSS, HTML files
3. **NPM Packages** - Frontend component libraries
4. **SBOMs** - Software Bill of Materials for frontend dependencies
5. **Test Reports** - Unit tests, E2E tests, accessibility testing
6. **Build Evidence** - Comprehensive frontend build attestations

Each artifact moves together through the promotion pipeline: DEV → QA → STAGING → PROD.

For the non-JFrog evidence plan and gates, see: `../bookverse-demo-init/docs/EVIDENCE_PLAN.md`.

## 🔄 Workflows

- [`ci.yml`](.github/workflows/ci.yml) — CI: frontend tests, asset builds, Docker builds, publish artifacts/build-info, AppTrust version and evidence
- [`promote.yml`](.github/workflows/promote.yml) — Promote the web app version through stages with evidence
- [`promotion-rollback.yml`](.github/workflows/promotion-rollback.yml) — Roll back a promoted web application version (demo utility)
