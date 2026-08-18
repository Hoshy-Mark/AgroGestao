/**
 * Fornecedores, clientes e contratos (GDD secoes 11.2, 11.3 e 14).
 */
export interface Fornecedor {
  id: string;
  nome: string;
  precoKgRacao: number;
  prazoPagamentoDias: number; // 0 = a vista
  prazoEntregaDias: number;
  confiabilidade: number; // 0-100
}

export interface Cliente {
  id: string;
  nome: string;
  relacionamento: number; // 0-100, especifico dessa contraparte (GDD secao 14)
  confianca: number; // 0-100
  sensibilidadePreco: number; // 0-100
  prazoMedioDias: number;
}

export interface Contrato {
  id: string;
  clienteId: string;
  volumeMensal: number;
  precoUnitario: number;
  prazoRecebimentoDias: number;
  duracaoMeses: number;
  iniciadoEm: string; // ISO date
}
