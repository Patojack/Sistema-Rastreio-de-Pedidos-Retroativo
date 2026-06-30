import { useState, useMemo, type FC } from 'react'
import type { Pedido } from '@/types/pedido'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { calcDiasAtraso } from '@/lib/orders'
import './OrdersTable.css'

type SortColumn = keyof Pedido | 'diasAtraso'
type SortDirection = 'asc' | 'desc'

interface SortState {
  column: SortColumn
  direction: SortDirection
}

interface OrdersTableProps {
  pedidos: Pedido[]
  onSelectPedido: (pedido: Pedido) => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function sortPedidos(pedidos: Pedido[], sort: SortState): Pedido[] {
  return [...pedidos].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    if (sort.column === 'diasAtraso') {
      const aEntregue = a.status === 'entregue_prazo' || a.status === 'entregue_atrasado'
      const bEntregue = b.status === 'entregue_prazo' || b.status === 'entregue_atrasado'
      aVal = calcDiasAtraso(a.prazoEntrega, aEntregue ? a.dataEntrega : undefined)
      bVal = calcDiasAtraso(b.prazoEntrega, bEntregue ? b.dataEntrega : undefined)
    } else {
      aVal = a[sort.column]
      bVal = b[sort.column]
    }

    const cmp =
      typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal), 'pt-BR', { sensitivity: 'base' })

    return sort.direction === 'asc' ? cmp : -cmp
  })
}

export const OrdersTable: FC<OrdersTableProps> = ({ pedidos, onSelectPedido }) => {
  const [sort, setSort] = useState<SortState>({ column: 'diasAtraso', direction: 'desc' })

  const sorted = useMemo(() => sortPedidos(pedidos, sort), [pedidos, sort])

  const handleSort = (column: SortColumn) => {
    setSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'desc' },
    )
  }

  const sortIcon = (col: SortColumn) => {
    if (sort.column !== col) return <span className="orders-table__sort-icon orders-table__sort-icon--inactive">↕</span>
    return (
      <span className="orders-table__sort-icon orders-table__sort-icon--active">
        {sort.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  if (pedidos.length === 0) {
    return (
      <div className="orders-table__empty">
        <span className="orders-table__empty-icon" aria-hidden="true">🔍</span>
        <p className="orders-table__empty-title">Nenhum pedido encontrado</p>
        <p className="orders-table__empty-hint">Tente ajustar ou limpar os filtros.</p>
      </div>
    )
  }

  return (
    <div className="orders-table__wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            <th>
              <button className="orders-table__th-btn" onClick={() => handleSort('numero')}>
                Nº Pedido {sortIcon('numero')}
              </button>
            </th>
            <th>
              <button className="orders-table__th-btn" onClick={() => handleSort('cliente')}>
                Cliente {sortIcon('cliente')}
              </button>
            </th>
            <th className="orders-table__col--hide-mobile">
              <button className="orders-table__th-btn" onClick={() => handleSort('transportadora')}>
                Transportadora {sortIcon('transportadora')}
              </button>
            </th>
            <th>
              <button className="orders-table__th-btn" onClick={() => handleSort('status')}>
                Status {sortIcon('status')}
              </button>
            </th>
            <th>
              <button className="orders-table__th-btn" onClick={() => handleSort('prazoEntrega')}>
                Prazo {sortIcon('prazoEntrega')}
              </button>
            </th>
            <th>
              <button className="orders-table__th-btn" onClick={() => handleSort('diasAtraso')}>
                Atraso {sortIcon('diasAtraso')}
              </button>
            </th>
            <th className="orders-table__col--hide-mobile">
              <button className="orders-table__th-btn" onClick={() => handleSort('ultimaAtualizacao')}>
                Atualização {sortIcon('ultimaAtualizacao')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => {
            const isEntregue = p.status === 'entregue_prazo' || p.status === 'entregue_atrasado'
            const dias = calcDiasAtraso(p.prazoEntrega, isEntregue ? p.dataEntrega : undefined)
            return (
              <tr
                key={p.numero}
                className="orders-table__row orders-table__row--clickable"
                onClick={() => onSelectPedido(p)}
                aria-label={`Ver detalhes do pedido Nº ${p.numero}`}
              >
                <td className="orders-table__cell--numero">{p.numero}</td>
                <td>{p.cliente || '—'}</td>
                <td className="orders-table__col--hide-mobile orders-table__cell--carrier">
                  {p.transportadora || '—'}
                </td>
                <td>
                  <StatusBadge status={p.status} size="sm" />
                </td>
                <td>{formatDate(p.prazoEntrega)}</td>
                <td>
                  <span className={`orders-table__dias${dias > 0 ? ' orders-table__dias--late' : dias < 0 ? ' orders-table__dias--ok' : ''}`}>
                    {dias > 0 ? `+${dias}d` : dias < 0 ? `${dias}d` : '—'}
                  </span>
                </td>
                <td className="orders-table__col--hide-mobile orders-table__cell--date">
                  {formatDate(p.ultimaAtualizacao)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
