# Architecture

## System Overview
Type Motion uses a tiered AI generation strategy powered by Google's Gemini models.

### Data Flow
1. **Concierge (Gemini 3 Flash)**: Intakes user context and classifies risk.
2. **Design (Gemini 3 Pro Image)**: Generates 1K/4K high-fidelity starting frames with text.
3. **Motion (Veo 3.1)**: Translates the frame into a cinematic MP4.
4. **Sound (Gemini TTS)**: Compiles a cinematic voiceover based on text sentiment.

### PWA & Offline
- Service Worker manages caching of CDN assets and UI shell.
- Local Storage is avoided for media to maintain high performance.
