# Observability

## Error Reporting
- Gemini API errors are captured and displayed in the `AppState.ERROR` UI state.
- Service worker registration errors are logged to the console.

## Performance Metrics
- Track `Vitals` for First Contentful Paint (FCP).
- Generation latency is tracked via `ProcessingStatus` time logs in DevTools.

## Monitoring
- Cloud-native logging (Vercel Analytics or Google Analytics) should be added to `index.html` for production traffic.