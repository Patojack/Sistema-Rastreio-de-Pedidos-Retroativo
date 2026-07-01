# PRD — Rastreio de Pedidos Retroativo
**Pato Jack · Business Architect Jr.: Diego Prado · Junho 2026**

---

## 1. Visão Geral

Sistema de rastreamento automatizado de pedidos da Pato Jack, construído em N8N.
Roda diariamente às 8h, busca os pedidos dos últimos 20 dias no Tiny ERP, consulta o status nas transportadoras (Correios e Loggi) e atualiza o Google Sheets com classificação de prazo.

**Status atual:** ativo em produção.  
**Transportadoras cobertas:** Correios, Loggi.  
**Transportadora pendente:** FM Transportes.

---

## 2. Fluxo Atual (As-Is)

```
[Trigger 8h]
     │
     ├──► [Busca Token Loggi]   — autenticação na API Loggi
     ├──► [Busca Token Tiny]    — lê credenciais do Google Sheets
     │
     ▼
[Buscar Pedidos Tiny]           — GET API Tiny v3, janela: 20 dias até ontem
     │
     ▼
[Processa Pedidos]              — normaliza transportadora por regex (Correios)
     │                            e por comprimento do código (Loggi)
     ▼
[Tem rastreio?] ──── NÃO ──►  (descartado — sem tratamento)
     │
    SIM
     │
     ├── [É Correios?] ── SIM ──► [Rastreia SRO] ──► [Classifica Correios] ──► [Atualiza Sheets]
     │
     └── NÃO (Loggi) ──────────► [Loop + Wait]  ──► [Rastreia Loggi API]  ──► [Classifica Loggi] ──► [Atualiza Sheets Loggi]
```

### Classificações de status geradas

| Categoria | Significado |
|---|---|
| `entregue_prazo` | Entregue dentro do prazo estimado |
| `entregue_atrasado` | Entregue, mas após o prazo |
| `em_rota_prazo` | Em trânsito, dentro do prazo |
| `em_rota_atrasado` | Em trânsito, já fora do prazo |

---

## 3. Problemas Identificados

### 3.1 Gaps de cobertura
- **FM Transportes não integrada** — pedidos enviados pela FM não são rastreados
- **Pedidos sem rastreio são descartados silenciosamente** — sem registro de que existem, sem alerta

### 3.2 Detecção de transportadora frágil
- Correios identificado por regex no código
- Loggi identificado por comprimento do código
- **Sem fallback** para códigos fora do padrão esperado — classificados incorretamente ou ignorados

### 3.3 Ausência de alertas
- Nenhuma notificação para pedidos `em_rota_atrasado`
- Nenhum alerta para pedidos que pararam de atualizar (possível extravio)
- Time descobre atrasos reativamente, via reclamação do cliente

### 3.4 Janela fixa de 20 dias
- Pedidos com prazo de entrega superior a 20 dias saem da janela antes de serem entregues
- Sem parametrização por transportadora ou tipo de envio

### 3.5 Rate limiting manual
- Loop da Loggi tem Wait fixo — sem retry automático em caso de erro 429 ou timeout

---

## 4. Objetivos da Evolução

| # | Objetivo | Prioridade |
|---|---|---|
| 1 | Integrar FM Transportes ao fluxo de rastreamento | Alta |
| 2 | Alertas automáticos para atrasos e possíveis extravios | Alta |
| 3 | Tratamento de pedidos sem rastreio (registro + notificação) | Média |
| 4 | Detecção de transportadora robusta com fallback | Média |
| 5 | Janela de rastreio parametrizável por transportadora | Baixa |
| 6 | Retry automático com backoff exponencial na Loggi | Baixa |

---

## 5. Escopo da Próxima Versão

### 5.1 Integração FM Transportes
- Mapear API ou método de rastreio disponível (API própria, Correios SRO via contrato, scraping)
- Adicionar nó de identificação de códigos FM no `Processa Pedidos`
- Criar branch de rastreamento e classificação equivalente ao de Correios/Loggi
- Atualizar Sheets com coluna de transportadora preenchida corretamente

### 5.2 Sistema de Alertas
- Novo nó após classificação: filtra `em_rota_atrasado` e sem atualização há mais de 5 dias
- Disparo via WhatsApp (Evolution API / Z-API) ou e-mail
- Mensagem com: nº pedido, transportadora, último status, dias em atraso

### 5.3 Tratamento de Pedidos sem Rastreio
- Em vez de descartar: registrar no Sheets com status `sem_rastreio`
- Após X dias sem rastreio: acionar alerta para revisão manual

### 5.4 Detecção de Transportadora Robusta
- Substituir regex + comprimento por mapa explícito de prefixos de código
- Adicionar campo `transportadora_raw` no Sheets para auditoria
- Nó de fallback: classifica como `transportadora_desconhecida` e registra para revisão

---

## 6. Fora do Escopo (por ora)

- Integração com plataformas de e-commerce além do Tiny
- Dashboard dedicado fora do Google Sheets
- Rastreamento em tempo real (modelo atual é batch diário)

---

## 7. Estrutura de Dados no Sheets

### Aba: Pedidos

| Campo | Origem | Observação |
|---|---|---|
| Nº Pedido Olist | Tiny API | Chave de match no appendOrUpdate |
| Transportadora | Processa Pedidos | Correios / Loggi / FM / desconhecida |
| Código de Rastreio | Tiny API | Pode ser nulo |
| Status | Classifica* | entregue_prazo, entregue_atrasado, em_rota_prazo, em_rota_atrasado, sem_rastreio |
| Último Evento | API transportadora | Descrição do último evento de rastreio |
| Data Último Evento | API transportadora | — |
| Prazo Estimado | Tiny API | — |
| Em Atraso? | Calculado | Booleano derivado do status |

---

## 8. Critérios de Aceite

- [ ] FM Transportes rastreada e classificada com as mesmas categorias de status
- [ ] Pedidos sem rastreio registrados no Sheets com status `sem_rastreio`
- [ ] Alertas disparados automaticamente para `em_rota_atrasado` e sem atualização há 5+ dias
- [ ] Nenhum pedido descartado silenciosamente — todo pedido tem registro no Sheets
- [ ] Detecção de transportadora com fallback explícito para códigos desconhecidos

---

## 8.1 FM Transportes — Especificação Técnica

### Mecanismo de integração
- **Modelo:** Webhook de saída (FM faz POST para URL configurada no painel)
- **Autenticação:** Basic Authentication — header `Authorization` com username e password fornecidos ao time de vendas da FM
- **SLA:** FM considera falha se a resposta demorar mais de 10s ou retornar HTTP ≠ 200
- **Idempotência:** eventos podem chegar fora de ordem e mais de uma vez — o N8N precisa tratar duplicatas

### Payload recebido
| Campo | Tipo | Descrição |
|---|---|---|
| `TrackingCode` | string | Código de rastreio interno FM |
| `VolumeId` | string | Id do volume |
| `OrderNumber` | string | Número do pedido (a confirmar se bate com Nº Pedido Olist do Tiny) |
| `FiscalNoteNumber` | string | Número da nota fiscal |
| `FiscalNoteAccessKey` | string | Chave de acesso NF |
| `PostOfficeTracking` | string | Código de rastreio dos Correios (quando FM repassa last-mile) |
| `DeliveryInformation` | object | Info de entrega; `ReceivedBy` = nome do recebedor |
| `Trackings` | array | Eventos ocorridos com o pedido |

### Mapeamento de status → categorias do sistema
| Códigos FM | Categoria |
|---|---|
| 1 (Encomenda Entregue), 90 (Encomenda Finalizada) | `entregue_prazo` ou `entregue_atrasado` |
| 83 (Coleta Realizada), 101 (Despachada), 102 (Em Trânsito), 104 (Processo Entrega Iniciado), 106 (Conferida), 108 (Em Rota) | `em_rota_prazo` ou `em_rota_atrasado` |
| 0 (Aguardando Postagem) | `aguardando_envio` |
| 6, 13, 21, 29, 39, 41, 48, 49, 51, 52, 64 | `em_rota_atrasado` (problema na entrega) |
| 27 (Roubo), 30 (Extravio), 107 (Apreendida) | `em_rota_atrasado` + flag `extravio` |
| 25 (Em Devolução), 61 (Devolvida), 111 (Devolução em andamento) | `devolvido` |

### Pendências antes de implementar
- [x] Confirmar se `OrderNumber` da FM corresponde ao `Nº Pedido Olist` do Tiny — **confirmado em 26/06/2026**
- [ ] Obter username e password do time de vendas da FM para configurar Basic Auth no N8N
- [ ] Decidir URL base do N8N para cadastrar no painel FM (ex: `https://n8n.patojack.com.br/webhook/fm-rastreio`)

---

## 9. Decisões Técnicas Registradas

| Decisão | Escolha | Motivo |
|---|---|---|
| Canal de alertas | Slack (Incoming Webhook) | Time já usa Slack; webhook é mais simples que OAuth |
| Frequência dos alertas | A cada 4 horas | Cobertura ao longo do dia sem ser intrusivo |
| Arquitetura do alerta | Workflow separado lendo o Sheets | Evita chamar Tiny/Correios/Loggi novamente |
| Formato da mensagem | Resumo consolidado (Block Kit) | Mais acionável que notificações individuais por pedido |
| Detecção de extravio | Prazo vencido há 10+ dias em rota | Proxy enquanto coluna `Data Último Evento` não existe no Sheets |
| FM Transportes | Adiado | Método de rastreio não confirmado ainda |

### Pendências abertas

- [ ] Confirmar método de rastreio da FM Transportes (API própria, SRO via contrato, outro)
- [ ] Criar Incoming Webhook no Slack e definir canal de destino
- [ ] Decidir se detecção precisa de extravio (5 dias sem evento do rastreador) justifica adicionar coluna `Data Último Evento` no workflow principal

## 10. Próximos Passos

Ver `PLANO.md` para tasks detalhadas de implementação.
