import type { Pedido } from '@/types/pedido'
import { calcDiasAtraso } from '@/lib/orders'

export function filterByPeriod(pedidos: Pedido[], days: number | null): Pedido[] {
  if (days === null) return pedidos
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - days)
  return pedidos.filter((p) => {
    if (!p.dataPedido) return false
    const date = new Date(p.dataPedido + 'T00:00:00')
    return date >= cutoff
  })
}

export function calcOnTimeRate(pedidos: Pedido[]): number | null {
  const entregues = pedidos.filter(
    (p) => p.status === 'entregue_prazo' || p.status === 'entregue_atrasado',
  )
  if (entregues.length === 0) return null
  const noPrazo = entregues.filter((p) => p.status === 'entregue_prazo').length
  return Math.round((noPrazo / entregues.length) * 100)
}

export function calcAvgDelay(pedidos: Pedido[]): number {
  const atrasados = pedidos.filter(
    (p) => p.status === 'em_rota_atrasado' || p.status === 'entregue_atrasado',
  )
  if (atrasados.length === 0) return 0
  const total = atrasados.reduce((sum, p) => sum + calcDiasAtraso(p.prazoEntrega), 0)
  return Math.round(total / atrasados.length)
}

export type CarrierStat = {
  transportadora: string
  total: number
  entregues: number
  noPrazo: number
  taxa: number
}

export function calcByCarrier(pedidos: Pedido[]): CarrierStat[] {
  const map = new Map<string, { transportadora: string; total: number; entregues: number; noPrazo: number }>()

  for (const p of pedidos) {
    const key = p.transportadora?.toLowerCase().trim() || 'desconhecida'
    if (!map.has(key)) {
      map.set(key, { transportadora: key, total: 0, entregues: 0, noPrazo: 0 })
    }
    const stat = map.get(key)!
    stat.total++
    if (p.status === 'entregue_prazo' || p.status === 'entregue_atrasado') {
      stat.entregues++
      if (p.status === 'entregue_prazo') stat.noPrazo++
    }
  }

  return Array.from(map.values())
    .filter((s) => s.entregues > 0)
    .map((s) => ({ ...s, taxa: Math.round((s.noPrazo / s.entregues) * 100) }))
    .sort((a, b) => b.taxa - a.taxa)
}

export type StatusSlice = {
  name: string
  value: number
  color: string
}

export function calcStatusDistribution(pedidos: Pedido[]): StatusSlice[] {
  const counts = { entregue_prazo: 0, entregue_atrasado: 0, em_rota_prazo: 0, em_rota_atrasado: 0, outros: 0 }

  for (const p of pedidos) {
    if (p.status === 'entregue_prazo') counts.entregue_prazo++
    else if (p.status === 'entregue_atrasado') counts.entregue_atrasado++
    else if (p.status === 'em_rota_prazo') counts.em_rota_prazo++
    else if (p.status === 'em_rota_atrasado') counts.em_rota_atrasado++
    else counts.outros++
  }

  return [
    { name: 'Entregue no prazo', value: counts.entregue_prazo, color: '#393F31' },
    { name: 'Entregue atrasado', value: counts.entregue_atrasado, color: '#2B2320' },
    { name: 'Em rota · prazo', value: counts.em_rota_prazo, color: '#697255' },
    { name: 'Em rota · atrasado', value: counts.em_rota_atrasado, color: '#E1AF66' },
    { name: 'Outros', value: counts.outros, color: '#EADDC5' },
  ].filter((s) => s.value > 0)
}

export type VolumeByCarrier = {
  name: string
  value: number
}

export function calcVolumeByCarrier(pedidos: Pedido[]): VolumeByCarrier[] {
  const map = new Map<string, number>()
  for (const p of pedidos) {
    const key = p.transportadora?.toLowerCase().trim() || 'desconhecida'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}
