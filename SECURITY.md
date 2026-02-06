# Security & Compliance

## API Secrets
- `API_KEY` is injected via `process.env`. 
- **Critical:** Never commit the API key. 

## Content Security Policy (CSP) Guidance
Recommended headers:
- `script-src 'self' https://cdn.tailwindcss.com https://aistudiocdn.com https://unpkg.com;`
- `connect-src 'self' https://generativelanguage.googleapis.com;`
- `img-src 'self' data: https://www.gstatic.com;`

## Data Privacy
- Media generation happens via Google Veo.
- Ensure user inputs are scrubbed of PII before generation.