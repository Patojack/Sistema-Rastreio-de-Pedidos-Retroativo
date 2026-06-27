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

## Deploy na Vercel

### Variáveis de ambiente obrigatórias

Configure as seguintes variáveis em **Settings > Environment Variables** no dashboard da Vercel:

| Variável | Descrição |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON completo da Service Account em **uma única linha** (sem quebras de linha reais) |
| `SHEET_ID` | ID da planilha Google Sheets (encontrado na URL entre `/d/` e `/edit`) |
| `SHEET_TAB_NAME` | Nome da aba na planilha — padrão: `Pedidos` |

> **Atenção:** O valor de `GOOGLE_SERVICE_ACCOUNT_KEY` deve ser o JSON inteiro em uma única linha. As quebras de linha dentro do `private_key` devem ser representadas como `\n` (literal), não como quebras reais. Exemplo:
>
> ```
> {"type":"service_account","client_email":"nome@projeto.iam.gserviceaccount.com","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",...}
> ```

### Passos

1. No dashboard da Vercel, vá em **Settings > Environment Variables**
2. Adicione as 3 variáveis acima com escopo `Production` (e `Preview` se necessário)
3. Faça um novo deploy (ou triggere via push) para que as variáveis sejam aplicadas
4. Teste chamando `https://seu-dominio.vercel.app/api/pedidos`
