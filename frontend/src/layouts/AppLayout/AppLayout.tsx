import { useState, type FC, type ReactNode } from 'react'
import './AppLayout.css'

type Page = 'dashboard' | 'metrics'

interface AppLayoutProps {
  header: ReactNode
  dashboardPage: ReactNode
  metricsPage: ReactNode
}

export const AppLayout: FC<AppLayoutProps> = ({ header, dashboardPage, metricsPage }) => {
  const [activePage, setActivePage] = useState<Page>('dashboard')

  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar" aria-label="Navegação">
        <div className="app-layout__sidebar-brand">
          <span className="app-layout__sidebar-logo">Pato Jack</span>
          <span className="app-layout__sidebar-tagline">Rastreio</span>
        </div>

        <nav className="app-layout__sidebar-nav">
          <button
            className={`app-layout__nav-item${activePage === 'dashboard' ? ' app-layout__nav-item--active' : ''}`}
            onClick={() => setActivePage('dashboard')}
            aria-current={activePage === 'dashboard' ? 'page' : undefined}
          >
            <span className="app-layout__nav-icon" aria-hidden="true">📊</span>
            Dashboard
          </button>
          <button
            className={`app-layout__nav-item${activePage === 'metrics' ? ' app-layout__nav-item--active' : ''}`}
            onClick={() => setActivePage('metrics')}
            aria-current={activePage === 'metrics' ? 'page' : undefined}
          >
            <span className="app-layout__nav-icon" aria-hidden="true">📈</span>
            Métricas
          </button>
        </nav>

        <div className="app-layout__sidebar-footer">v0.1.0</div>
      </aside>

      <div className="app-layout__content">
        {header}
        <main className="app-layout__main">
          {activePage === 'dashboard' ? dashboardPage : metricsPage}
        </main>
      </div>

      <nav className="app-layout__bottom-nav" aria-label="Navegação principal">
        <button
          className={`app-layout__bottom-item${activePage === 'dashboard' ? ' app-layout__bottom-item--active' : ''}`}
          onClick={() => setActivePage('dashboard')}
          aria-current={activePage === 'dashboard' ? 'page' : undefined}
        >
          <span className="app-layout__nav-icon" aria-hidden="true">📊</span>
          <span>Dashboard</span>
        </button>
        <button
          className={`app-layout__bottom-item${activePage === 'metrics' ? ' app-layout__bottom-item--active' : ''}`}
          onClick={() => setActivePage('metrics')}
          aria-current={activePage === 'metrics' ? 'page' : undefined}
        >
          <span className="app-layout__nav-icon" aria-hidden="true">📈</span>
          <span>Métricas</span>
        </button>
      </nav>
    </div>
  )
}
