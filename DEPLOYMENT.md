# Deployment Guide

## Target 1: Vercel / Netlify
- Static site hosting.
- Set `API_KEY` in project environment variables.
- Auto-detects `index.html`.

## Target 2: Cloudflare Pages
- Upload folder.
- Add headers for `manifest.webmanifest` to serve as `application/manifest+json`.

## Target 3: Firebase Hosting
- `firebase init hosting`.
- Set `public` to root.
- Deploy with `firebase deploy`.