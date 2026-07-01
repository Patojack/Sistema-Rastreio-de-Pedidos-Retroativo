# FM Transportes — Documentação da API

**Base URL:** `https://integration.fmtransportes.com.br/api`
**Versão:** v1 (OpenAPI 3.1.1)
**Autenticação:** Basic Auth — usuário e senha em Base64 (`usuario:senha`)

> Credenciais e CNPJ não devem ser commitados. Configurar diretamente nos nós do N8N.

---

## Autenticação

Todas as requisições exigem o header:

```
Authorization: Basic <base64(usuario:senha)>
```

---

## Rate Limits

| Endpoint | Limite |
|---|---|
| POST /v1/quote | 30 req/s |
| GET/POST /v1/label | 15 req/s |
| POST /v1/invoicing | 1 req/s |
| PUT /v1/invoicing | 1 req/2s |
| POST /v1/order | 15 req/s |
| DELETE /v1/order | 15 req/s |
| POST /v1/tracking | 1 req/s |
| PUT /v1/tracking | 1 req/2s |

---

## Endpoints

### Cotação

#### `POST /v1/quote` — Cotação de Frete

Retorna valores e prazo de entrega por CEP, peso e dimensões.

**Body:**
```json
{
  "clientDocument": "00000000000000",
  "zipCodeDestination": 1310100,
  "totalValue": 0.00,
  "totalWeight": 0.00,
  "volumes": [
    { "length": 1, "height": 1, "width": 1 }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "service": 1, "value": 1.0, "deliveryTime": 1 }
  ]
}
```

---

### Etiqueta

#### `POST /v1/label` — Emissão de Etiqueta

Solicita geração de etiqueta PDF. Retorna `labelId` temporário (expira em 1h).

**Body:**
```json
{
  "clientDocument": "00000000000000",
  "field": 2,
  "value": ""
}
```

Valores do campo `field`:
- `1` — Código de Rastreio
- `2` — Número do Pedido
- `3` — Chave da Nota Fiscal
- `4` — Chave da Declaração

**Response 200:**
```json
{
  "success": true,
  "data": { "labelId": "string" }
}
```

---

#### `GET /v1/label/{labelId}` — Download de Etiqueta

Retorna URL temporária para download do PDF (expira em 1h após geração).

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "message": "string", "url": "string" }
  ]
}
```

---

### Faturamento

#### `POST /v1/invoicing` — Pesquisa de Faturamento

Retorna até 500 faturamentos dos últimos 7 dias **não confirmados**, ordenados por data crescente. Inclui `trackingCode` por pedido.

**Body:**
```json
{
  "clientDocument": "00000000000000"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "trackingCode": "string",
      "orderNumber": "string",
      "fiscalNoteNumber": "string",
      "fiscalNoteAccessKey": "string",
      "invoicingId": "string",
      "date": "string",
      "value": 1,
      "volumes": [
        {
          "volumeId": "string",
          "realWeight": 1,
          "cubicWeight": 1,
          "cubicDescription": "string"
        }
      ]
    }
  ]
}
```

> **Importante:** Sempre confirmar os IDs retornados via `PUT /v1/invoicing`. Sem confirmação, os mesmos faturamentos continuam aparecendo.

---

#### `PUT /v1/invoicing` — Confirmação de Processamento de Faturamento

Marca até 500 faturamentos como processados.

**Body:**
```json
{
  "clientDocument": "00000000000000",
  "invoicingIds": ["string"]
}
```

---

### Pedidos

#### `POST /v1/order` — Importação de Pedidos (lote)

Envia pedidos para fila de processamento. Operação assíncrona — uma vez gravado, requisições subsequentes com os mesmos dados são descartadas.

#### `DELETE /v1/order/{trackingCode}` — Exclusão de Pedido

Remove pedido da fila, desde que não tenha sido movimentado pela FM.

---

### Rastreamento ⚡ (usado no N8N)

#### `POST /v1/tracking` — Pesquisa de Eventos

Retorna até 500 eventos dos últimos 7 dias **não confirmados**, ordenados por data crescente.

**Body:**
```json
{
  "clientDocument": "00000000000000"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "trackingCode": "string",
      "volumeId": "string",
      "orderNumber": "string",
      "fiscalNoteNumber": "string",
      "fiscalNoteAccessKey": "string",
      "postOfficeTracking": "string",
      "deliveryInformation": {
        "receivedBy": "string"
      },
      "trackings": [
        {
          "trackingId": "string",
          "date": "string",
          "status": 1
        }
      ]
    }
  ]
}
```

> **Importante:** Sempre confirmar os `trackingId`s via `PUT /v1/tracking`. Sem confirmação, os mesmos eventos continuam retornando.

---

#### `PUT /v1/tracking` — Confirmação de Processamento de Evento

Marca até 500 eventos como processados.

**Body:**
```json
{
  "clientDocument": "00000000000000",
  "trackingIds": ["string"]
}
```

---

## Mapeamento de Status FM → StatusCategoria

| Código FM | Descrição | StatusCategoria |
|---|---|---|
| 0 | Pedido Criado / Aguardando Postagem | `aguardando_envio` |
| 1 | Encomenda Entregue | `entregue_prazo` |
| 6 | Endereço Errado / Insuficiente | `em_rota_atrasado` |
| 10 | Em rota (genérico) | `em_rota_prazo` |
| 13 | Endereço Fora do Perímetro Urbano | `em_rota_atrasado` |
| 14 | Mercadoria Avariada | `em_rota_atrasado` |
| 15 | Embalagem em Análise | `em_rota_prazo` |
| 21 | Destinatário Ausente / Local Fechado | `em_rota_atrasado` |
| 25 | Em Processo de Devolução | `em_rota_atrasado` |

---

## Integração no N8N

### Fluxo de Rastreamento (diário)

```
Todo dia1 → Busca Eventos FM (POST /v1/tracking)
           → Classifica FM (Code)
           → Tem Eventos FM? (IF)
               TRUE → Upsert Supabase FM Rastreio (POST batch)
                     → Confirma Eventos FM (PUT /v1/tracking)
```

### Fluxo de Webhook (tempo real)

```
Webhook FM (POST /webhook/fm-tracking, Basic Auth)
  → Mapeia Status FM (Code)
  → Upsert Supabase FM Webhook
  → Responde 200
```

**URL de produção do webhook:**
```
https://leticiapatojack.app.n8n.cloud/webhook/fm-tracking
```

**Credenciais Basic Auth do webhook:**
- User: `fm_patojack`
- Password: configurado no painel FM via time de vendas
