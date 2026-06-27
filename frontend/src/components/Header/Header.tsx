import type { FC } from 'react'
import './Header.css'

interface HeaderProps {
  isLoading: boolean
  lastUpdated: Date | null
}

export const Header: FC<HeaderProps> = ({ isLoading, lastUpdated }) => {
  const formatTime = (date: Date) =>
    date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo">Pato Jack</span>
        <span className="header__subtitle">Rastreio de Pedidos</span>
      </div>
      <div className="header__meta">
        {isLoading && (
          <span className="header__spinner" role="status" aria-label="Atualizando dados…" />
        )}
        {!isLoading && lastUpdated && (
          <span className="header__updated">
            Atualizado {formatTime(lastUpdated)}
          </span>
        )}
      </div>
    </header>
  )
}
