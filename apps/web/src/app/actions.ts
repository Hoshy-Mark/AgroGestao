"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { avancarDiaLote } from "@/lib/api";

/**
 * Precos de referencia ate existir um modulo de Mercado de verdade (GDD
 * secao 15): racao ~R$2,50/kg (estimativa derivada, GAME_ECONOMY.md secao
 * 3) e ovo no ponto medio da faixa Cepea R$3,00-7,50/duzia (GAME_ECONOMY.md
 * secao 5). Fixos por enquanto — nao ha fornecedor/cliente para negociar.
 */
const PRECO_KG_RACAO_REFERENCIA = 2.5;
const PRECO_MEDIO_DUZIA_REFERENCIA = 4.5;

/**
 * Roda um dia do MotorPostura sobre o lote (via API) e guarda o resultado
 * numa cookie de vida curta so pra mostrar "o que aconteceu hoje" logo
 * depois do redirect — sem precisar de um HistoricoProducao persistido
 * ainda (GDD secao 9, pendente).
 */
export async function avancarDia(loteId: string) {
  const resposta = await avancarDiaLote(loteId, {
    precoKgRacao: PRECO_KG_RACAO_REFERENCIA,
    precoMedioDuzia: PRECO_MEDIO_DUZIA_REFERENCIA,
  });

  (await cookies()).set("ultimoResultado", JSON.stringify(resposta.resultado), {
    path: "/",
    maxAge: 5,
  });

  // Sem isso o Next reaproveita o Router Cache da renderizacao anterior de
  // "/" e mostra caixa/dia desatualizados apos o redirect.
  revalidatePath("/");
  redirect("/");
}
