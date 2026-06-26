import { useQuery } from '@tanstack/react-query'
import type { Pedido } from '@/types/pedido'

const FIVE_MINUTES = 5 * 60 * 1000

async function fetchPedidos(): Promise<Pedido[]> {
  const res = await fetch('/api/pedidos')
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<Pedido[]>
}

export function useSheetData() {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['pedidos'],
    queryFn: fetchPedidos,
    staleTime: FIVE_MINUTES,
    refetchInterval: FIVE_MINUTES,
  })

  return {
    pedidos: data ?? [],
    isLoading,
    isError,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
  }
}
