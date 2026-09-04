# Nestam server

Node 22 + TypeScript backend for the Nestam companion (see [../README.md](../README.md)).

```bash
npm install
cp .env.example .env    # optional; leave SARVAM_API_KEY empty for offline mock mode
npm run dev             # http://localhost:4020 (dev console) · /api/status
npm test                # vitest
npm run smoke           # end-to-end against a running server
npm run build && npm start
```

Docker: `docker build -t nestam-server . && docker run -p 4020:4020 -e SARVAM_API_KEY=… -v nestam-data:/app/data nestam-server`.
Railway/Fly: set the service root to `nestam/server`, mount a volume at `/app/data`, health check `/api/status`.
