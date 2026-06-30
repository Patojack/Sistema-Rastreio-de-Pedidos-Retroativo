import { useState, useMemo, type FC } from 'react'
import { Card } from '@/components/Card/Card'
import { FilterBar } from '@/components/FilterBar/FilterBar'
import { OrdersTable } from '@/components/OrdersTable/OrdersTable'
import { OrderModal } from '@/components/OrderModal/OrderModal'
import { useSheetData } from '@/hooks/useSheetData'
import { applyFilters, calcMetrics } from '@/lib/orders'
import type { Filters, Pedido } from '@/types/pedido'
import './Dashboard.css'

const EMPTY_FILTERS: Filters = { transportadora: '', status: '', search: '', dataInicio: '', dataFim: '' }

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
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)

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
      </div>

      {!isLoading && !isError && (
        <div className="dashboard__distribution">
          <h3 className="dashboard__distribution-title">Distribuição de Status · Últimos 30 dias</h3>
          <table className="dashboard__dist-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Qtd</th>
                <th>% do Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '✓ Entregue no prazo', value: metrics.entreguesNoPrazo },
                { label: '⏱ Entregue atrasado', value: metrics.entregueAtrasado },
                { label: '🚚 Em rota · prazo', value: metrics.emRota - metrics.emRotaAtrasado },
                { label: '! Em rota · atrasado', value: metrics.emRotaAtrasado, highlight: true },
                { label: '📦 Aguardando envio', value: metrics.aguardandoEnvio },
                { label: '📋 Faturado', value: metrics.faturado },
              ].map(({ label, value, highlight }) => (
                <tr key={label} className={highlight ? 'dashboard__dist-row--late' : ''}>
                  <td>{label}</td>
                  <td>{value}</td>
                  <td>{metrics.totalBase30 > 0 ? `${Math.round((value / metrics.totalBase30) * 100)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td>{metrics.totalBase30}</td>
                <td>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

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
