import type { Pedido, Filters } from '@/types/pedido'

export function calcDiasAtraso(prazoEntrega: string, dataEntrega?: string): number {
  if (!prazoEntrega) return 0
  const prazo = new Date(prazoEntrega + 'T00:00:00')
  const ref = dataEntrega ? new Date(dataEntrega + 'T00:00:00') : new Date()
  ref.setHours(0, 0, 0, 0)
  return Math.floor((ref.getTime() - prazo.getTime()) / 86_400_000)
}

export function applyFilters(pedidos: Pedido[], filters: Filters): Pedido[] {
  const q = filters.search.toLowerCase().trim()
  return pedidos.filter((p) => {
    if (filters.transportadora && p.transportadora.toLowerCase() !== filters.transportadora.toLowerCase()) return false
    if (filters.status && p.status !== filters.status) return false
    if (q && !p.numero.toLowerCase().includes(q) && !p.cliente.toLowerCase().includes(q)) return false
    if (filters.dataInicio && p.dataPedido && p.dataPedido < filters.dataInicio) return false
    if (filters.dataFim && p.dataPedido && p.dataPedido > filters.dataFim) return false
    return true
  })
}

export function calcMetrics(pedidos: Pedido[]) {
  const today = new Date().toISOString().split('T')[0]

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0]

  const base30 = pedidos.filter((p) => !p.dataPedido || p.dataPedido >= cutoff)

  const emRota = base30.filter(
    (p) => p.status === 'em_rota_prazo' || p.status === 'em_rota_atrasado',
  ).length

  const atrasados = base30.filter((p) => p.status === 'em_rota_atrasado').length

  const entreguesHoje = pedidos.filter(
    (p) =>
      (p.status === 'entregue_prazo' || p.status === 'entregue_atrasado') &&
      p.dataEntrega === today,
  ).length

  const faturado = base30.filter((p) => p.status === 'faturado').length
  const aguardandoEnvio = base30.filter((p) => p.status === 'aguardando_envio').length
  const emRotaAtrasado = base30.filter((p) => p.status === 'em_rota_atrasado').length
  const entregueAtrasado = base30.filter((p) => p.status === 'entregue_atrasado').length
  const entreguesNoPrazo = base30.filter((p) => p.status === 'entregue_prazo').length
  const totalBase30 = base30.length

  return { emRota, atrasados, entreguesHoje, faturado, aguardandoEnvio, emRotaAtrasado, entregueAtrasado, entreguesNoPrazo, totalBase30 }
}
