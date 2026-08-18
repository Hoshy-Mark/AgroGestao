/**
 * Estado consolidado da empresa (GDD secao 9).
 * Usado pelo motor de simulacao e pelo sistema de eventos para calcular
 * probabilidades condicionadas ao estado real da empresa (GDD secao 19).
 */
export interface EstadoEmpresa {
  caixa: number;
  divida: number;
  limiteCredito: number;
  reputacao: number; // 0-100, visao geral do mercado sobre a empresa
  conhecimento: number; // 0-100, trilha de progresso do jogador (GDD secao 17)
  diaAtual: number;
}

export interface Empresa {
  id: string;
  nome: string;
  fundadaEm: string; // ISO date
  estado: EstadoEmpresa;
  unidadesNegocioIds: string[];
}

export function criarEmpresaHerdada(params: {
  id: string;
  nome: string;
  caixaInicial: number;
  dividaHerdada: number;
  fundadaEm: string;
}): Empresa {
  return {
    id: params.id,
    nome: params.nome,
    fundadaEm: params.fundadaEm,
    estado: {
      caixa: params.caixaInicial,
      divida: params.dividaHerdada,
      limiteCredito: 0,
      reputacao: 40, // reputacao herdada da familia, nem alta nem baixa
      conhecimento: 0, // jogador comeca sem conhecimento administrativo (GDD secao 5)
      diaAtual: 0,
    },
    unidadesNegocioIds: [],
  };
}
