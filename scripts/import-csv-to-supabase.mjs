import { readFileSync } from 'fs'
import { resolve } from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY
const CSV_PATH = process.argv[2]

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Erro: defina SUPABASE_URL e SUPABASE_SECRET_KEY como variáveis de ambiente.')
  process.exit(1)
}

if (!CSV_PATH) {
  console.error('Uso: node import-csv-to-supabase.mjs <caminho-do-csv>')
  process.exit(1)
}

const STATUS_MAP = {
  '✓ Entregue no prazo':  'entregue_prazo',
  '⏱ Entregue atrasado':  'entregue_atrasado',
  '🚚 Em rota · prazo':   'em_rota_prazo',
  '! Em rota · atrasado': 'em_rota_atrasado',
  '📦 Aguardando envio':  'aguardando_envio',
  '📋 Faturado':          'faturado',
  '📭 Sem rastreio':      'sem_rastreio',
}

function parseDate(val) {
  const s = val?.trim()
  return s && s.match(/^\d{4}-\d{2}-\d{2}$/) ? s : null
}

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim())
  const rows = []
  for (const line of lines.slice(1)) {
    const cols = line.split(',')
    rows.push({
      numero:             cols[0]?.trim() ?? '',
      cliente:            cols[1]?.trim() || null,
      rastreio:           cols[2]?.trim() || null,
      transportadora:     cols[3]?.trim() || null,
      status:             STATUS_MAP[cols[4]?.trim()] ?? 'sem_rastreio',
      situacao_tiny:      cols[5]?.trim() || null,
      data_pedido:        parseDate(cols[6]),
      prazo_entrega:      parseDate(cols[7]),
      data_entrega:       parseDate(cols[8]),
      ultima_atualizacao: parseDate(cols[9]),
    })
  }
  return rows
}

async function insertBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${res.status}: ${text}`)
  }
}

const content = readFileSync(resolve(CSV_PATH), 'utf-8')
const rows = parseCSV(content)

console.log(`${rows.length} linhas encontradas. Enviando para o Supabase...`)

const BATCH_SIZE = 100
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  await insertBatch(batch)
  console.log(`Inseridos ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`)
}

console.log('Importação concluída.')
