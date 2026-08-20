/**
 * Cliente da API (apps/api). So roda em codigo de servidor (Server
 * Components / Server Actions) — por isso a env var e `API_URL`, sem o
 * prefixo `NEXT_PUBLIC_`, e nunca vai parar no bundle do navegador.
 */
const API_URL = process.env.API_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly corpo: string
  ) {
    super(
      status === 0
        ? `não foi possível alcançar ${API_URL} (${corpo})`
        : `API respondeu ${status}${corpo ? `: ${corpo}` : ""}`
    );
    this.name = "ApiError";
  }
}

async function apiFetch<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } catch (erro) {
    throw new ApiError(
      0,
      erro instanceof Error ? erro.message : "falha de rede desconhecida"
    );
  }

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    throw new ApiError(resposta.status, corpo);
  }

  return resposta.json() as Promise<T>;
}

export interface EmpresaApi {
  id: string;
  nome: string;
  fundadaEm: string;
  caixa: number;
  divida: number;
  limiteCredito: number;
  reputacao: number;
  conhecimento: number;
  diaAtual: number;
  unidadesNegocio?: UnidadeNegocioApi[];
}

export interface UnidadeNegocioApi {
  id: string;
  empresaId: string;
  nome: string;
  tipo: "matriz" | "poedeira";
  capacidadeAves: number;
  fornecedorRacaoId: string | null;
  fornecedorRacao?: FornecedorApi | null;
  lotes?: LoteApi[];
  /** So o contrato ativo (a API ja filtra), no maximo 1 no MVP. */
  contratos?: ContratoApi[];
}

export interface FornecedorApi {
  id: string;
  nome: string;
  precoKgRacao: number;
  prazoPagamentoDias: number;
  prazoEntregaDias: number;
  confiabilidade: number;
}

export interface LoteApi {
  id: string;
  unidadeNegocioId: string;
  linhagem: "branca" | "vermelha";
  quantidadeAvesAlojadas: number;
  quantidadeAvesVivas: number;
  idadeDias: number;
}

export interface ClienteApi {
  id: string;
  nome: string;
  relacionamento: number;
  confianca: number;
  sensibilidadePreco: number;
  prazoMedioDias: number;
  precoOfertadoDuzia: number;
  volumeMensalDuzias: number;
}

export interface ContratoApi {
  id: string;
  clienteId: string;
  unidadeNegocioId: string;
  precoUnitario: number;
  volumeMensalDuzias: number;
  prazoRecebimentoDias: number;
  ativo: boolean;
  cliente?: ClienteApi;
}

export interface ResultadoAvancarDia {
  lote: LoteApi;
  empresa: EmpresaApi;
  resultado: {
    estagio: string;
    avesVivasInicioDia: number;
    avesMortasHoje: number;
    avesVivasFimDia: number;
    ovosProduzidos: number;
    racaoConsumidaKg: number;
    custoRacao: number;
    receitaBruta: number;
    funrural: number;
    receitaLiquida: number;
    custoMaoDeObra: number;
    resultado: number;
  };
}

export function criarEmpresa(input: {
  nome: string;
  caixaInicial: number;
  dividaHerdada: number;
}) {
  return apiFetch<EmpresaApi>("/empresas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function buscarEmpresa(id: string) {
  return apiFetch<EmpresaApi>(`/empresas/${id}`);
}

export interface HistoricoMensalApi {
  receitaTotal: number;
  custoTotal: number;
  resultadoTotal: number;
  diasComRegistro: number;
  registros: unknown[];
}

/** Resumo dos ultimos ~30 dias simulados avancados (nao um mes de calendario real) — base do DRE, GDD secao 21.4. */
export function buscarHistoricoMensal(empresaId: string) {
  return apiFetch<HistoricoMensalApi>(`/empresas/${empresaId}/historico`);
}

export function listarFornecedores() {
  return apiFetch<FornecedorApi[]>("/fornecedores");
}

export function listarClientes() {
  return apiFetch<ClienteApi[]>("/clientes");
}

export function fecharContrato(unidadeNegocioId: string, clienteId: string) {
  return apiFetch<ContratoApi>("/contratos", {
    method: "POST",
    body: JSON.stringify({ unidadeNegocioId, clienteId }),
  });
}

export function escolherFornecedorRacao(unidadeId: string, fornecedorId: string) {
  return apiFetch<UnidadeNegocioApi>(`/unidades-negocio/${unidadeId}/fornecedor-racao`, {
    method: "PATCH",
    body: JSON.stringify({ fornecedorId }),
  });
}

export function criarUnidadeNegocio(input: {
  empresaId: string;
  nome: string;
  tipo: "matriz" | "poedeira";
  capacidadeAves: number;
}) {
  return apiFetch<UnidadeNegocioApi>("/unidades-negocio", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function criarLote(input: {
  unidadeNegocioId: string;
  linhagem: "branca" | "vermelha";
  quantidadeAvesAlojadas: number;
  idadeDiasInicial?: number;
}) {
  return apiFetch<LoteApi>("/lotes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function avancarDiaLote(
  loteId: string,
  mercado: {
    /** Se omitido, a API usa o Fornecedor escolhido pela unidade (ver /mercado), com fallback pro preco de referencia. */
    precoKgRacao?: number;
    /** Se omitido, a API usa o Contrato ativo da unidade (ver /comercial), com fallback pro preco de referencia. */
    precoMedioDuzia?: number;
    mes?: number;
    custoMaoDeObraMensal?: number;
    aliquotaFunrural?: number;
  } = {}
) {
  return apiFetch<ResultadoAvancarDia>(`/lotes/${loteId}/avancar-dia`, {
    method: "POST",
    body: JSON.stringify(mercado),
  });
}
