import { useMemo, type FC } from 'react'
import { Card } from '@/components/Card/Card'
import { useSheetData } from '@/hooks/useSheetData'
import { calcMetrics } from '@/lib/orders'
import './Dashboard.css'

const STATUS_CARDS = [
  { key: 'entreguesNoPrazo',  label: 'Entregue no prazo',   icon: '✓'  },
  { key: 'entregueAtrasado',  label: 'Entregue atrasado',   icon: '⏱'  },
  { key: 'emRota',            label: 'Em rota · prazo',     icon: '🚚' },
  { key: 'emRotaAtrasado',    label: 'Em rota · atrasado',  icon: '!'  },
  { key: 'aguardandoEnvio',   label: 'Aguardando envio',    icon: '📦' },
  { key: 'faturado',          label: 'Faturado',            icon: '📋' },
] as const

type MetricKey = typeof STATUS_CARDS[number]['key']

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="dashboard__error">
      <span className="dashboard__error-icon" aria-hidden="true">⚠️</span>
      <p className="dashboard__error-title">Erro ao carregar pedidos</p>
      <p className="dashboard__error-hint">Verifique a conexão ou as credenciais.</p>
      <button className="dashboard__error-retry" onClick={onRetry} type="button">
        Tentar novamente
      </button>
    </div>
  )
}

export const DashboardPage: FC = () => {
  const { pedidos, isLoading, isError, refetch } = useSheetData()
  const metrics = useMemo(() => calcMetrics(pedidos), [pedidos])

  if (isError) return <ErrorState onRetry={refetch} />

  const emRotaPrazo = metrics.emRota - metrics.emRotaAtrasado

  const metricValues: Record<MetricKey, number> = {
    entreguesNoPrazo: metrics.entreguesNoPrazo,
    entregueAtrasado: metrics.entregueAtrasado,
    emRota:           emRotaPrazo,
    emRotaAtrasado:   metrics.emRotaAtrasado,
    aguardandoEnvio:  metrics.aguardandoEnvio,
    faturado:         metrics.faturado,
  }

  return (
    <div className="dashboard">
      <div className="dashboard__cards">
        <Card title="Em Rota" value={isLoading ? '—' : metrics.emRota} icon="🚚" />
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

      {!isLoading && (
        <>
          <p className="dashboard__section-title">Distribuição de Status · Últimos 30 dias</p>
          <div className="dashboard__status-grid">
            {STATUS_CARDS.map(({ key, label, icon }) => (
              <Card
                key={key}
                title={label}
                value={metricValues[key]}
                icon={icon}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
