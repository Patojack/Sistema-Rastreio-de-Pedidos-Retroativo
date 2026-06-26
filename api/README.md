# api/

Vercel Serverless Functions for the Pato Jack order tracking dashboard.

Each `.ts` file here becomes a serverless endpoint automatically deployed by Vercel.

## Endpoints

### `GET /api/pedidos`

Reads the "Rastreio Pato Jack" Google Sheet (tab: Pedidos) and returns normalized order data as JSON.

Credentials stay server-side via a Service Account. The React client never touches the Sheets API directly.

**Response — array of `Pedido`:**
```json
[
  {
    "numero": "12345",
    "cliente": "João Silva",
    "rastreio": "AA123456789BR",
    "transportadora": "correios",
    "status": "em_rota_prazo",
    "situacaoTiny": "enviado",
    "dataPedido": "2026-06-01",
    "prazoEntrega": "2026-06-10",
    "dataEntrega": "",
    "ultimaAtualizacao": "2026-06-26"
  }
]
```

## Testing locally with `vercel dev`

### Prerequisites

1. Install the Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Create a `.env` file at the project root (never commit it):
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n..."}
   SHEET_ID=1sZFs-AWYny0G5bA0-PoriKpLGso42LDZkqCp7gHxBWU
   SHEET_TAB_NAME=Pedidos
   ```
   The `GOOGLE_SERVICE_ACCOUNT_KEY` value must be the full Service Account JSON as a single-line string.

3. Link the project to Vercel (first time only):
   ```bash
   vercel link
   ```

### Running

From the project root:
```bash
vercel dev
```

This starts both the Vercel Function runtime (for `api/`) and the Vite dev server (for `frontend/`), proxied together on `http://localhost:3000`.

Test the endpoint directly:
```bash
curl http://localhost:3000/api/pedidos
```

Expected: JSON array. If env vars are missing, returns `{ "error": "Missing required env vars: ..." }`.
