import { useState, useMemo, type FC } from 'react'
import { Card } from '@/components/Card/Card'
import { FilterBar } from '@/components/FilterBar/FilterBar'
import { OrdersTable } from '@/components/OrdersTable/OrdersTable'
import { useSheetData } from '@/hooks/useSheetData'
import { applyFilters, calcMetrics } from '@/lib/orders'
import type { Filters } from '@/types/pedido'
import './Dashboard.css'

const EMPTY_FILTERS: Filters = { transportadora: '', status: '', search: '' }

function TableSkeleton() {
  return (
    <div className="dashboard__skeleton-wrapper">
      <div className="dashboard__skeleton-header" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="dashboard__skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  )
}

interface ErrorStateProps {
  onRetry: () => void
}

function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="dashboard__error">
      <span className="dashboard__error-icon" aria-hidden="true">⚠️</span>
      <p className="dashboard__error-title">Erro ao carregar pedidos</p>
      <p className="dashboard__error-hint">Verifique a conexão ou as credenciais da planilha.</p>
      <button className="dashboard__error-retry" onClick={onRetry} type="button">
        Tentar novamente
      </button>
    </div>
  )
}

export const DashboardPage: FC = () => {
  const { pedidos, isLoading, isError, refetch } = useSheetData()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const metrics = useMemo(() => calcMetrics(pedidos), [pedidos])
  const filteredPedidos = useMemo(() => applyFilters(pedidos, filters), [pedidos, filters])

  return (
    <div className="dashboard">
      <div className="dashboard__cards">
        <Card
          title="Em Rota"
          value={isLoading ? '—' : metrics.emRota}
          icon="🚚"
        />
        <Card
          title="Atrasados"
          value={isLoading ? '—' : metrics.atrasados}
          icon="⚠️"
          trend={metrics.atrasados > 0 ? 'down' : 'neutral'}
        />
        <Card
          title="Entregues Hoje"
          value={isLoading ? '—' : metrics.entreguesHoje}
          icon="✓"
          trend={metrics.entreguesHoje > 0 ? 'up' : 'neutral'}
        />
        <Card
          title="Possíveis Extravios"
          value={isLoading ? '—' : metrics.extravios}
          icon="🔍"
          trend={metrics.extravios > 0 ? 'down' : 'neutral'}
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <FilterBar filters={filters} onChange={setFilters} />
          <OrdersTable pedidos={filteredPedidos} />
        </>
      )}
    </div>
  )
}
