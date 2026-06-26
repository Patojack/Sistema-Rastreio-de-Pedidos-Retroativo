import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'

type StatusCategoria =
  | 'entregue_prazo'
  | 'entregue_atrasado'
  | 'em_rota_prazo'
  | 'em_rota_atrasado'
  | 'aguardando_envio'
  | 'faturado'
  | 'sem_rastreio'

const STATUS_MAP: Record<string, StatusCategoria> = {
  '✓ Entregue no prazo': 'entregue_prazo',
  '⏱ Entregue atrasado': 'entregue_atrasado',
  '🚚 Em rota · prazo': 'em_rota_prazo',
  '! Em rota · atrasado': 'em_rota_atrasado',
  '📦 Aguardando envio': 'aguardando_envio',
  '📋 Faturado': 'faturado',
  '📭 Sem rastreio': 'sem_rastreio',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const sheetId = process.env.SHEET_ID

  if (!keyJson || !sheetId) {
    return res.status(500).json({
      error: 'Missing required env vars: GOOGLE_SERVICE_ACCOUNT_KEY and SHEET_ID',
    })
  }

  let credentials: { client_email: string; private_key: string }
  try {
    credentials = JSON.parse(keyJson)
  } catch {
    return res.status(500).json({
      error: 'GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON',
    })
  }

  try {
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Pedidos',
    })

    const rows = response.data.values ?? []

    // First row is the header — skip it
    if (rows.length <= 1) {
      return res.status(200).json([])
    }

    const pedidos = rows.slice(1).map((row) => ({
      numero:            row[0]  ?? '',
      cliente:           row[1]  ?? '',
      rastreio:          row[2]  ?? '',
      transportadora:    row[3]  ?? '',
      status:            (STATUS_MAP[row[4]] ?? 'sem_rastreio') as StatusCategoria,
      situacaoTiny:      row[5]  ?? '',
      dataPedido:        row[6]  ?? '',
      prazoEntrega:      row[7]  ?? '',
      dataEntrega:       row[8]  ?? '',
      ultimaAtualizacao: row[9]  ?? '',
    }))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    return res.status(200).json(pedidos)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: `Failed to fetch sheet data: ${message}` })
  }
}
