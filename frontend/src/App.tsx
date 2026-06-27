import { Header } from '@/components/Header/Header'
import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { DashboardPage } from '@/pages/Dashboard/Dashboard'
import { useSheetData } from '@/hooks/useSheetData'

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
      dashboardPage={<DashboardPage />}
      metricsPage={<MetricsPlaceholder />}
    />
  )
}
