# api/

Vercel Serverless Functions — Fase 2.

Each `.ts` file here becomes a serverless endpoint automatically deployed by Vercel.

Planned:
- `pedidos.ts` — reads the "Rastreio Pato Jack" Google Sheet and returns normalized order data as JSON.
  Credentials stay server-side; the React client never touches the Sheets API directly.
