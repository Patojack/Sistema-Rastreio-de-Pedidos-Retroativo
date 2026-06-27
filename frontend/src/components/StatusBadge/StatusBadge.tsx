import type { FC } from 'react'
import type { StatusCategoria } from '@/types/pedido'
import './StatusBadge.css'

interface StatusConfig {
  label: string
  icon: string
  modifier: string
}

const STATUS_CONFIG: Record<StatusCategoria, StatusConfig> = {
  entregue_prazo:    { label: 'Entregue no prazo',  icon: '✓',  modifier: 'delivered-ok' },
  entregue_atrasado: { label: 'Entregue atrasado',  icon: '⏱', modifier: 'delivered-late' },
  em_rota_prazo:     { label: 'Em rota · prazo',    icon: '🚚', modifier: 'in-transit-ok' },
  em_rota_atrasado:  { label: 'Em rota · atrasado', icon: '!',  modifier: 'in-transit-late' },
  aguardando_envio:  { label: 'Aguardando envio',   icon: '📦', modifier: 'waiting' },
  faturado:          { label: 'Faturado',            icon: '📋', modifier: 'waiting' },
  sem_rastreio:      { label: 'Sem rastreio',        icon: '📭', modifier: 'waiting' },
}

interface StatusBadgeProps {
  status: StatusCategoria
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const { label, icon, modifier } = STATUS_CONFIG[status]

  return (
    <span
      className={`status-badge status-badge--${modifier} status-badge--${size}`}
      role="status"
      aria-label={label}
    >
      {showIcon && (
        <span className="status-badge__icon" aria-hidden="true">{icon}</span>
      )}
      <span className="status-badge__label">{label}</span>
    </span>
  )
}
