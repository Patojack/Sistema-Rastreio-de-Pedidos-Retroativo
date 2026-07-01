import { useState, type FC, type ReactNode } from 'react'
import './AppLayout.css'

type Page = 'dashboard' | 'rastreio' | 'metrics'

interface AppLayoutProps {
  header: ReactNode
  dashboardPage: ReactNode
  rastreioPag: ReactNode
  metricsPage: ReactNode
}

export const AppLayout: FC<AppLayoutProps> = ({ header, dashboardPage, rastreioPag, metricsPage }) => {
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const navItems: { page: Page; icon: string; label: string }[] = [
    { page: 'dashboard', icon: '📊', label: 'Dashboard' },
    { page: 'rastreio',  icon: '📦', label: 'Rastreio'  },
    { page: 'metrics',   icon: '📈', label: 'Métricas'  },
  ]

  const currentPage =
    activePage === 'dashboard' ? dashboardPage :
    activePage === 'rastreio'  ? rastreioPag   :
    metricsPage

  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar" aria-label="Navegação">
        <div className="app-layout__sidebar-brand">
          <span className="app-layout__sidebar-logo">Pato Jack</span>
          <span className="app-layout__sidebar-tagline">Rastreio</span>
        </div>

        <nav className="app-layout__sidebar-nav">
          {navItems.map(({ page, icon, label }) => (
            <button
              key={page}
              className={`app-layout__nav-item${activePage === page ? ' app-layout__nav-item--active' : ''}`}
              onClick={() => setActivePage(page)}
              aria-current={activePage === page ? 'page' : undefined}
            >
              <span className="app-layout__nav-icon" aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="app-layout__sidebar-footer">v0.5.0</div>
      </aside>

      <div className="app-layout__content">
        {header}
        <main className="app-layout__main">
          {currentPage}
        </main>
      </div>

      <nav className="app-layout__bottom-nav" aria-label="Navegação principal">
        {navItems.map(({ page, icon, label }) => (
          <button
            key={page}
            className={`app-layout__bottom-item${activePage === page ? ' app-layout__bottom-item--active' : ''}`}
            onClick={() => setActivePage(page)}
            aria-current={activePage === page ? 'page' : undefined}
          >
            <span className="app-layout__nav-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
