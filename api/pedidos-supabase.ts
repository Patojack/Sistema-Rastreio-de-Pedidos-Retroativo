import type { VercelRequest, VercelResponse } from '@vercel/node'

type StatusCategoria =
  | 'entregue_prazo'
  | 'entregue_atrasado'
  | 'em_rota_prazo'
  | 'em_rota_atrasado'
  | 'aguardando_envio'
  | 'faturado'
  | 'sem_rastreio'

interface SupabasePedido {
  id: number
  numero: string
  cliente: string | null
  rastreio: string | null
  transportadora: string | null
  status: string | null
  situacao_tiny: string | null
  data_pedido: string | null
  prazo_entrega: string | null
  data_entrega: string | null
  ultima_atualizacao: string | null
  created_at: string
}

function toStr(val: string | null | undefined): string {
  return val ?? ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Missing required env vars: SUPABASE_URL and SUPABASE_SECRET_KEY',
    })
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/pedidos?select=*&order=data_pedido.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    )

    if (!response.ok) {
      const text = await response.text()
      return res.status(500).json({
        error: `Supabase error ${response.status}: ${text}`,
      })
    }

    const rows: SupabasePedido[] = await response.json()

    const pedidos = rows.map((row) => ({
      numero:            toStr(row.numero),
      cliente:           toStr(row.cliente),
      rastreio:          toStr(row.rastreio),
      transportadora:    toStr(row.transportadora),
      status:            (toStr(row.status) || 'sem_rastreio') as StatusCategoria,
      situacaoTiny:      toStr(row.situacao_tiny),
      dataPedido:        toStr(row.data_pedido),
      prazoEntrega:      toStr(row.prazo_entrega),
      dataEntrega:       toStr(row.data_entrega),
      ultimaAtualizacao: toStr(row.ultima_atualizacao),
    }))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    return res.status(200).json(pedidos)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: `Failed to fetch from Supabase: ${message}` })
  }
}
