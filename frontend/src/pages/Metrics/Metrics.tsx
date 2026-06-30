import { useState, useMemo, type FC } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useSheetData } from '@/hooks/useSheetData'
import {
  filterByPeriod,
  calcOnTimeRate,
  calcAvgDelay,
  calcByCarrier,
  calcStatusDistribution,
  calcVolumeByCarrier,
} from '@/lib/metrics'
import './Metrics.css'

type Period = 7 | 30 | 90 | null

const PERIODS: { label: string; value: Period }[] = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: 'Todos', value: null },
]

function filterByDateRange(pedidos: import('@/types/pedido').Pedido[], from: string, to: string) {
  return pedidos.filter((p) => {
    if (!p.dataPedido) return false
    if (from && p.dataPedido < from) return false
    if (to && p.dataPedido > to) return false
    return true
  })
}

const TOOLTIP_STYLE = {
  backgroundColor: '#F2EBD9',
  border: '1px solid rgba(43,35,32,0.12)',
  borderRadius: 8,
  fontSize: 13,
  color: '#2B2320',
}

const CURSOR_STYLE = { fill: 'rgba(225,175,102,0.08)' }

export const MetricsPage: FC = () => {
  const { pedidos, isLoading } = useSheetData()
  const [period, setPeriod] = useState<Period>(30)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasDateRange = dateFrom !== '' || dateTo !== ''

  const filtered = useMemo(() => {
    if (hasDateRange) return filterByDateRange(pedidos, dateFrom, dateTo)
    return filterByPeriod(pedidos, period)
  }, [pedidos, period, dateFrom, dateTo, hasDateRange])
  const onTimeRate = useMemo(() => calcOnTimeRate(filtered), [filtered])
  const avgDelay = useMemo(() => calcAvgDelay(filtered), [filtered])
  const volumeByCarrier = useMemo(() => calcVolumeByCarrier(filtered), [filtered])
  const statusDistribution = useMemo(() => calcStatusDistribution(filtered), [filtered])
  const byCarrier = useMemo(() => calcByCarrier(filtered), [filtered])

  const totalRow = useMemo(() => {
    const total = byCarrier.reduce((s, r) => s + r.total, 0)
    const entregues = byCarrier.reduce((s, r) => s + r.entregues, 0)
    const noPrazo = byCarrier.reduce((s, r) => s + r.noPrazo, 0)
    return {
      total,
      entregues,
      noPrazo,
      taxa: entregues > 0 ? Math.round((noPrazo / entregues) * 100) : null,
    }
  }, [byCarrier])

  return (
    <div className="metrics">
      <div className="metrics__filters">
        <div className="metrics__period-filter" role="group" aria-label="Filtrar por período">
          {PERIODS.map(({ label, value }) => (
            <button
              key={label}
              className={`metrics__period-btn${period === value && !hasDateRange ? ' metrics__period-btn--active' : ''}`}
              onClick={() => { setPeriod(value); setDateFrom(''); setDateTo('') }}
              type="button"
              aria-pressed={period === value && !hasDateRange}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="metrics__daterange">
          <input
            className="metrics__date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Data inicial"
          />
          <span className="metrics__datesep">—</span>
          <input
            className="metrics__date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Data final"
          />
          {hasDateRange && (
            <button
              className="metrics__date-clear"
              onClick={() => { setDateFrom(''); setDateTo('') }}
              type="button"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="metrics__summary-cards">
        <div className="metrics__summary-card">
          <span className="metrics__summary-label">Entregas no prazo</span>
          <span className="metrics__summary-value">
            {isLoading ? '—' : onTimeRate !== null ? `${onTimeRate}%` : '—'}
          </span>
        </div>
        <div className="metrics__summary-card">
          <span className="metrics__summary-label">Média de atraso</span>
          <span className="metrics__summary-value">
            {isLoading ? '—' : `${avgDelay} dias`}
          </span>
        </div>
      </div>

      <div className="metrics__charts-row">
        <div className="metrics__chart-card" aria-label="Gráfico de volume de pedidos por transportadora">
          <h3 className="metrics__chart-title">Volume por Transportadora</h3>
          <div className="metrics__chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeByCarrier}
                margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#8C7B74' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#8C7B74' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={CURSOR_STYLE}
                />
                <Bar dataKey="value" name="Pedidos" fill="#E1AF66" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metrics__chart-card" aria-label="Gráfico de distribuição de status dos pedidos">
          <h3 className="metrics__chart-title">Distribuição de Status</h3>
          <div className="metrics__chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="40%"
                  innerRadius="38%"
                  outerRadius="62%"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => (
                    <span style={{ color: '#5A4A44' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {byCarrier.length > 0 && (
        <div className="metrics__table-card">
          <h3 className="metrics__chart-title">% no Prazo por Transportadora</h3>
          <div className="metrics__table-wrapper">
            <table className="metrics__table" aria-label="Percentual de entregas no prazo por transportadora">
              <thead>
                <tr>
                  <th>Transportadora</th>
                  <th>Total</th>
                  <th>Entregues</th>
                  <th>No Prazo</th>
                  <th>% No Prazo</th>
                </tr>
              </thead>
              <tbody>
                {byCarrier.map((row) => (
                  <tr key={row.transportadora}>
                    <td className="metrics__table-carrier">{row.transportadora}</td>
                    <td>{row.total}</td>
                    <td>{row.entregues}</td>
                    <td>{row.noPrazo}</td>
                    <td>
                      <span
                        className={`metrics__taxa${row.taxa >= 80 ? ' metrics__taxa--good' : row.taxa < 60 ? ' metrics__taxa--bad' : ''}`}
                      >
                        {row.taxa}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total geral</td>
                  <td>{totalRow.total}</td>
                  <td>{totalRow.entregues}</td>
                  <td>{totalRow.noPrazo}</td>
                  <td>
                    <span className="metrics__taxa">
                      {totalRow.taxa !== null ? `${totalRow.taxa}%` : '—'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
