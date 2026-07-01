import { useState, useEffect, useRef, type FC } from 'react'
import type { Filters } from '@/types/pedido'
import './FilterBar.css'

const CARRIER_OPTIONS = [
  { value: '', label: 'Todas transportadoras' },
  { value: 'correios', label: 'Correios' },
  { value: 'loggi', label: 'Loggi' },
  { value: 'fm', label: 'FM' },
  { value: 'desconhecida', label: 'Desconhecida' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'em_rota', label: 'Em rota (todos)' },
  { value: 'em_rota_prazo', label: 'Em rota · prazo' },
  { value: 'em_rota_atrasado', label: 'Em rota · atrasado' },
  { value: 'entregue_prazo', label: 'Entregue no prazo' },
  { value: 'entregue_atrasado', label: 'Entregue atrasado' },
  { value: 'aguardando_envio', label: 'Aguardando envio' },
  { value: 'faturado', label: 'Faturado' },
  { value: 'sem_rastreio', label: 'Sem rastreio' },
]

const EMPTY_FILTERS: Filters = { transportadora: '', status: '', search: '', dataInicio: '', dataFim: '' }

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export const FilterBar: FC<FilterBarProps> = ({ filters, onChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Sync search input when filters are cleared externally
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  const handleSearch = (value: string) => {
    setSearchInput(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange({ ...filtersRef.current, search: value })
    }, 300)
  }

  const isActive =
    filters.transportadora !== '' || filters.status !== '' || filters.search !== '' ||
    filters.dataInicio !== '' || filters.dataFim !== ''

  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        <input
          className="filter-bar__search"
          type="search"
          placeholder="Buscar por nº pedido ou cliente…"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Buscar pedido"
        />

        <select
          className="filter-bar__select"
          value={filters.transportadora}
          onChange={(e) => onChange({ ...filters, transportadora: e.target.value })}
          aria-label="Filtrar transportadora"
        >
          {CARRIER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          className="filter-bar__select"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          aria-label="Filtrar status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="filter-bar__daterange">
          <input
            className="filter-bar__date"
            type="date"
            value={filters.dataInicio}
            onChange={(e) => onChange({ ...filters, dataInicio: e.target.value })}
            aria-label="Data inicial"
            title="Data inicial do pedido"
          />
          <span className="filter-bar__datesep">—</span>
          <input
            className="filter-bar__date"
            type="date"
            value={filters.dataFim}
            onChange={(e) => onChange({ ...filters, dataFim: e.target.value })}
            aria-label="Data final"
            title="Data final do pedido"
          />
        </div>
      </div>

      {isActive && (
        <button
          className="filter-bar__clear"
          onClick={() => onChange(EMPTY_FILTERS)}
          type="button"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
