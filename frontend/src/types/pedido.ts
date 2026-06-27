export type StatusCategoria =
  | 'entregue_prazo'
  | 'entregue_atrasado'
  | 'em_rota_prazo'
  | 'em_rota_atrasado'
  | 'aguardando_envio'
  | 'faturado'
  | 'sem_rastreio'

export type Pedido = {
  numero: string
  cliente: string
  rastreio: string
  transportadora: string
  status: StatusCategoria
  situacaoTiny: string
  dataPedido: string
  prazoEntrega: string
  dataEntrega: string
  ultimaAtualizacao: string
}

export type Filters = {
  transportadora: string
  status: string
  search: string
}
