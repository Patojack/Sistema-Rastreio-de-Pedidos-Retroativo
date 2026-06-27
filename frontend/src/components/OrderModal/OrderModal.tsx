import { useEffect, useRef, type FC } from 'react'
import type { Pedido } from '@/types/pedido'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { calcDiasAtraso } from '@/lib/orders'
import './OrderModal.css'

const TRACKING_LINKS: Record<string, { label: string; url: string }> = {
  correios: {
    label: 'Rastrear nos Correios',
    url: 'https://rastreamento.correios.com.br/app/index.php',
  },
  loggi: {
    label: 'Rastrear na Loggi',
    url: 'https://www.loggi.com/rastreador/',
  },
  fm: {
    label: 'Rastrear na FM Transportes',
    url: 'https://fmtransportes.com.br',
  },
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

interface OrderModalProps {
  pedido: Pedido | null
  onClose: () => void
}

export const OrderModal: FC<OrderModalProps> = ({ pedido, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (pedido) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      closeBtnRef.current?.focus()
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [pedido])

  useEffect(() => {
    if (!pedido) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.hasAttribute('disabled'))

        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [pedido, onClose])

  if (!pedido) return null

  const dias = calcDiasAtraso(pedido.prazoEntrega)
  const carrierKey = pedido.transportadora?.toLowerCase().trim() ?? ''
  const trackingLink = TRACKING_LINKS[carrierKey]

  const handleCopyRastreio = async () => {
    if (pedido.rastreio) {
      await navigator.clipboard.writeText(pedido.rastreio)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="order-modal__overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="order-modal__panel" ref={panelRef}>
        <div className="order-modal__header">
          <h2 className="order-modal__title" id="order-modal-title">
            Pedido {pedido.numero}
          </h2>
          <button
            ref={closeBtnRef}
            className="order-modal__close"
            onClick={onClose}
            type="button"
            aria-label="Fechar detalhes do pedido"
          >
            ✕
          </button>
        </div>

        <div className="order-modal__status-section">
          <StatusBadge status={pedido.status} size="md" />
          <span
            className={`order-modal__dias-msg${dias > 0 ? ' order-modal__dias-msg--late' : ' order-modal__dias-msg--ok'}`}
          >
            {dias > 0 ? `${dias} dias de atraso` : 'No prazo'}
          </span>
        </div>

        <dl className="order-modal__details">
          <div className="order-modal__detail-row">
            <dt>Cliente</dt>
            <dd>{pedido.cliente || '—'}</dd>
          </div>
          <div className="order-modal__detail-row">
            <dt>Transportadora</dt>
            <dd>{pedido.transportadora || '—'}</dd>
          </div>
          <div className="order-modal__detail-row">
            <dt>Código de Rastreio</dt>
            <dd className="order-modal__tracking-row">
              <span className="order-modal__tracking-code">
                {pedido.rastreio || '—'}
              </span>
              {pedido.rastreio && (
                <button
                  className="order-modal__copy-btn"
                  onClick={handleCopyRastreio}
                  type="button"
                  aria-label="Copiar código de rastreio"
                >
                  Copiar
                </button>
              )}
            </dd>
          </div>
          <div className="order-modal__detail-row">
            <dt>Nota Fiscal</dt>
            <dd>{pedido.situacaoTiny || '—'}</dd>
          </div>
          <div className="order-modal__detail-row">
            <dt>Data do Pedido</dt>
            <dd>{formatDate(pedido.dataPedido)}</dd>
          </div>
          <div className="order-modal__detail-row">
            <dt>Prazo de Entrega</dt>
            <dd>{formatDate(pedido.prazoEntrega)}</dd>
          </div>
          {pedido.dataEntrega && (
            <div className="order-modal__detail-row">
              <dt>Data de Entrega</dt>
              <dd>{formatDate(pedido.dataEntrega)}</dd>
            </div>
          )}
        </dl>

        {trackingLink && (
          <div className="order-modal__external">
            <a
              href={trackingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="order-modal__tracking-link"
            >
              {trackingLink.label}
              <span aria-hidden="true"> ↗</span>
            </a>
          </div>
        )}

        <div className="order-modal__timeline">
          <h3 className="order-modal__timeline-title">Histórico de Eventos</h3>
          <div className="order-modal__timeline-placeholder">
            <span className="order-modal__timeline-icon" aria-hidden="true">🕐</span>
            <p>Histórico de eventos disponível após integração FM</p>
          </div>
        </div>
      </div>
    </div>
  )
}
