import type { FC } from 'react'
import './Card.css'

interface CardProps {
  title: string
  value: string | number
  icon: string
  trend?: 'up' | 'down' | 'neutral'
}

const TREND_ICON: Record<NonNullable<CardProps['trend']>, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

export const Card: FC<CardProps> = ({ title, value, icon, trend }) => (
  <div className="card">
    <div className="card__header">
      <span className="card__icon" aria-hidden="true">{icon}</span>
      {trend && (
        <span className={`card__trend card__trend--${trend}`} aria-label={`Tendência: ${trend}`}>
          {TREND_ICON[trend]}
        </span>
      )}
    </div>
    <div className="card__value">{value}</div>
    <div className="card__title">{title}</div>
  </div>
)
