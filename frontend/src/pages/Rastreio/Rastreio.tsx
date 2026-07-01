import { useState, useMemo, type FC } from 'react'
import { FilterBar } from '@/components/FilterBar/FilterBar'
import { OrdersTable } from '@/components/OrdersTable/OrdersTable'
import { OrderModal } from '@/components/OrderModal/OrderModal'
import { useSheetData } from '@/hooks/useSheetData'
import { applyFilters } from '@/lib/orders'
import type { Filters, Pedido } from '@/types/pedido'
import './Rastreio.css'

const DEFAULT_FILTERS: Filters = {
  transportadora: '',
  status: 'em_rota',
  search: '',
  dataInicio: '',
  dataFim: '',
}

function TableSkeleton() {
  return (
    <div className="rastreio__skeleton-wrapper">
      <div className="rastreio__skeleton-header" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rastreio__skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rastreio__error">
      <span className="rastreio__error-icon" aria-hidden="true">⚠️</span>
      <p className="rastreio__error-title">Erro ao carregar pedidos</p>
      <p className="rastreio__error-hint">Verifique a conexão ou as credenciais.</p>
      <button className="rastreio__error-retry" onClick={onRetry} type="button">
        Tentar novamente
      </button>
    </div>
  )
}

export const RastreioPage: FC = () => {
  const { pedidos, isLoading, isError, refetch } = useSheetData()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)

  const filteredPedidos = useMemo(() => applyFilters(pedidos, filters), [pedidos, filters])

  return (
    <div className="rastreio">
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <FilterBar filters={filters} onChange={setFilters} />
          <OrdersTable pedidos={filteredPedidos} onSelectPedido={setSelectedPedido} />
        </>
      )}

      <OrderModal pedido={selectedPedido} onClose={() => setSelectedPedido(null)} />
    </div>
  )
}
