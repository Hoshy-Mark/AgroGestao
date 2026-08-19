"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, criarEmpresa, criarLote, criarUnidadeNegocio } from "@/lib/api";

export interface EstadoAssumirHeranca {
  erro?: string;
}

/**
 * Cria a heranca completa (GDD secao 5) via API: empresa, a unidade de
 * postura e um lote que ja nasce no pico de producao (~27 semanas — "meio
 * de ciclo", GAME_ECONOMY.md secao 1), nao do zero. Guarda o id da empresa
 * numa cookie — ainda nao existe autenticacao/multiplayer, entao "sessao"
 * por enquanto e so "qual empresa este navegador esta jogando".
 */
export async function assumirHeranca(
  _estadoAnterior: EstadoAssumirHeranca,
  _formData: FormData
): Promise<EstadoAssumirHeranca> {
  let empresaId: string;

  try {
    const empresa = await criarEmpresa({
      nome: "Granja Herdada",
      caixaInicial: 8000,
      dividaHerdada: 15000,
    });
    empresaId = empresa.id;

    const unidade = await criarUnidadeNegocio({
      empresaId,
      nome: "Poedeira Comercial",
      tipo: "poedeira",
      capacidadeAves: 2000,
    });

    await criarLote({
      unidadeNegocioId: unidade.id,
      linhagem: "branca",
      quantidadeAvesAlojadas: 1500,
      idadeDiasInicial: 27 * 7, // pico de postura — Domain Bible secao 2.2
    });
  } catch (erro) {
    const mensagem =
      erro instanceof ApiError
        ? erro.message
        : "Erro desconhecido ao conectar com a API.";
    return { erro: mensagem };
  }

  (await cookies()).set("empresaId", empresaId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/");
  redirect("/");
}
