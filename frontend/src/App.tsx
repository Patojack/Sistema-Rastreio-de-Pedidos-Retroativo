import { Header } from '@/components/Header/Header'
import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { DashboardPage } from '@/pages/Dashboard/Dashboard'
import { RastreioPage } from '@/pages/Rastreio/Rastreio'
import { MetricsPage } from '@/pages/Metrics/Metrics'
import { useSheetData } from '@/hooks/useSheetData'

export default function App() {
  const { isLoading, lastUpdated } = useSheetData()

  return (
    <AppLayout
      header={<Header isLoading={isLoading} lastUpdated={lastUpdated} />}
      dashboardPage={<DashboardPage />}
      rastreioPag={<RastreioPage />}
      metricsPage={<MetricsPage />}
    />
  )
}
