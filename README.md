# Type Motion

Generate cinematic 3D animations from simple text using Gemini and Veo 3.1.

## TL;DR
High-end AI media generator built with React 19, Tailwind CSS, and Google GenAI SDK. Production-grade PWA with offline caching.

## Setup
1. Local Environment: Access `process.env.API_KEY`.
2. Serves via native ESM; no build step required for local dev.

## Env Vars
- `API_KEY`: Google Gemini API Key (Required).

## Build & Deploy
- Standard static hosting (Vercel, Netlify, Cloudflare).
- Ensure HTTPS for Service Worker functionality.

## Documentation
- [PWA Strategy](./PWA.md)
- [Security Guidelines](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Matrix](./TESTING.md)
- [Observability](./OBSERVABILITY.md)