import { Header } from '@/components/Header/Header'
import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { useSheetData } from '@/hooks/useSheetData'

function DashboardPlaceholder() {
  return (
    <div style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
      Dashboard — Fase 4
    </div>
  )
}

function MetricsPlaceholder() {
  return (
    <div style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
      Métricas — Fase 6
    </div>
  )
}

export default function App() {
  const { isLoading, lastUpdated } = useSheetData()

  return (
    <AppLayout
      header={<Header isLoading={isLoading} lastUpdated={lastUpdated} />}
      dashboardPage={<DashboardPlaceholder />}
      metricsPage={<MetricsPlaceholder />}
    />
  )
}
