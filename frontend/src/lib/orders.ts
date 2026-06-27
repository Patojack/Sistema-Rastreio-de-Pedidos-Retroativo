import type { Pedido, Filters } from '@/types/pedido'

export function calcDiasAtraso(prazoEntrega: string): number {
  if (!prazoEntrega) return 0
  const prazo = new Date(prazoEntrega + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - prazo.getTime()) / 86_400_000)
}

export function applyFilters(pedidos: Pedido[], filters: Filters): Pedido[] {
  const q = filters.search.toLowerCase().trim()
  return pedidos.filter((p) => {
    if (filters.transportadora && p.transportadora.toLowerCase() !== filters.transportadora.toLowerCase()) return false
    if (filters.status && p.status !== filters.status) return false
    if (q && !p.numero.toLowerCase().includes(q) && !p.cliente.toLowerCase().includes(q)) return false
    return true
  })
}

export function calcMetrics(pedidos: Pedido[]) {
  const today = new Date().toISOString().split('T')[0]

  const emRota = pedidos.filter(
    (p) => p.status === 'em_rota_prazo' || p.status === 'em_rota_atrasado',
  ).length

  const atrasados = pedidos.filter((p) => p.status === 'em_rota_atrasado').length

  const entreguesHoje = pedidos.filter(
    (p) =>
      (p.status === 'entregue_prazo' || p.status === 'entregue_atrasado') &&
      p.dataEntrega === today,
  ).length

  const extravios = pedidos.filter((p) => {
    if (p.status !== 'em_rota_atrasado' && p.status !== 'em_rota_prazo') return false
    return calcDiasAtraso(p.prazoEntrega) > 10
  }).length

  return { emRota, atrasados, entreguesHoje, extravios }
}
