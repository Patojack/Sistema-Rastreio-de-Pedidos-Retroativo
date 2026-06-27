# api/

Vercel Serverless Functions do dashboard de rastreio de pedidos da Pato Jack.

Cada arquivo `.ts` aqui se torna um endpoint serverless implantado automaticamente pela Vercel.

## Endpoints

### `GET /api/pedidos`

Lê a planilha "Rastreio Pato Jack" (aba: Pedidos) e retorna os dados de pedidos normalizados em JSON.

As credenciais ficam exclusivamente no servidor via Service Account. O cliente React nunca acessa a Sheets API diretamente.

**Resposta — array de `Pedido`:**
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

## Testando localmente com `vercel dev`

### Pré-requisitos

1. Instalar o Vercel CLI globalmente:
   ```bash
   npm i -g vercel
   ```

2. Criar um arquivo `.env` na raiz do projeto (nunca commitar):
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n..."}
   SHEET_ID=1sZFs-AWYny0G5bA0-PoriKpLGso42LDZkqCp7gHxBWU
   SHEET_TAB_NAME=Pedidos
   ```
   O valor de `GOOGLE_SERVICE_ACCOUNT_KEY` deve ser o JSON completo da Service Account em uma única linha.

3. Vincular o projeto à Vercel (apenas na primeira vez):
   ```bash
   vercel link
   ```

### Executando

A partir da raiz do projeto:
```bash
vercel dev
```

Isso inicia o runtime das Vercel Functions (para `api/`) e o servidor de desenvolvimento Vite (para `frontend/`), ambos proxiados em `http://localhost:3000`.

Testar o endpoint diretamente:
```bash
curl http://localhost:3000/api/pedidos
```

Resposta esperada: array JSON. Se as variáveis de ambiente estiverem ausentes, retorna `{ "error": "Missing required env vars: ..." }`.
