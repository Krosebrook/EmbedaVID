# Runbook

## Incident: "SW Registration Failed"
- **Cause**: Origin mismatch or sandboxed iframe.
- **Fix**: Registration script in `index.html` uses `window.location.href`. Ensure environment allows Service Workers.

## Incident: "Veo Generation Failed"
- **Cause**: Content filter or prompt safety violation.
- **Fix**: The Concierge safety gate should catch this. If not, check `geminiService` logs for specific candidate filter reasons.

## Incident: "404 Entity Not Found"
- **Cause**: Missing or unpaid API key.
- **Fix**: Call `openSelectKey()` to re-authenticate with a paid Google Cloud project.
