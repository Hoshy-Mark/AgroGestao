import { cookies } from "next/headers";
import { criarEmpresaHerdada } from "@agrogestao/domain";
import { ApiError, buscarEmpresa, type EmpresaApi } from "@/lib/api";

export interface EmpresaResumo {
  nome: string;
  diaAtual: number;
  caixa: number;
  divida: number;
  reputacao: number;
  conhecimento: number;
}

// Mock local — garante que a tela sempre renderiza algo coerente mesmo sem
// API/Postgres no ar (README: "sem Postgres so da pra rodar o frontend").
export function empresaMock(): EmpresaResumo {
  const empresa = criarEmpresaHerdada({
    id: "empresa-mock",
    nome: "Granja Herdada",
    caixaInicial: 8000,
    dividaHerdada: 15000,
    fundadaEm: new Date().toISOString(),
  });
  return {
    nome: empresa.nome,
    diaAtual: empresa.estado.diaAtual,
    caixa: empresa.estado.caixa,
    divida: empresa.estado.divida,
    reputacao: empresa.estado.reputacao,
    conhecimento: empresa.estado.conhecimento,
  };
}

export function paraResumoEmpresa(empresa: EmpresaApi): EmpresaResumo {
  return {
    nome: empresa.nome,
    diaAtual: empresa.diaAtual,
    caixa: empresa.caixa,
    divida: empresa.divida,
    reputacao: empresa.reputacao,
    conhecimento: empresa.conhecimento,
  };
}

export interface CarregamentoEmpresa {
  empresaId: string | null;
  empresa: EmpresaResumo;
  /** Objeto completo da API (unidadesNegocio/lotes inclusos) — null em modo demo. */
  empresaCompleta: EmpresaApi | null;
  conectadoApi: boolean;
  erroApi?: string;
}

/**
 * Le a cookie de sessao e busca a empresa na API. Usado tanto pelo layout
 * (chrome do AppShell) quanto por paginas que precisam do objeto completo —
 * o Next dedupe chamadas fetch identicas na mesma renderizacao, entao nao
 * ha custo real de repetir a chamada em vez de passar dado por props.
 */
export async function carregarEmpresaAtual(): Promise<CarregamentoEmpresa> {
  const empresaId = (await cookies()).get("empresaId")?.value ?? null;
  if (!empresaId) {
    return { empresaId: null, empresa: empresaMock(), empresaCompleta: null, conectadoApi: false };
  }

  try {
    const empresa = await buscarEmpresa(empresaId);
    return {
      empresaId,
      empresa: paraResumoEmpresa(empresa),
      empresaCompleta: empresa,
      conectadoApi: true,
    };
  } catch (erro) {
    const mensagem = erro instanceof ApiError ? erro.message : "erro desconhecido";
    return {
      empresaId,
      empresa: empresaMock(),
      empresaCompleta: null,
      conectadoApi: false,
      erroApi: mensagem,
    };
  }
}
