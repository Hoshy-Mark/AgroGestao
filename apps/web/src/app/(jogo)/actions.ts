"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { avancarDiaLote } from "@/lib/api";

/**
 * Preco de venda de referencia ate existir Cliente/Contrato de verdade (GDD
 * secao 15/16): ponto medio da faixa Cepea R$3,00-7,50/duzia
 * (GAME_ECONOMY.md secao 5). O preco de racao NAO entra mais aqui — o
 * servico deriva do Fornecedor escolhido pela unidade em /mercado,
 * com fallback pro preco de referencia se nenhum foi escolhido ainda.
 */
const PRECO_MEDIO_DUZIA_REFERENCIA = 4.5;

/**
 * Roda um dia do MotorPostura sobre o lote (via API) e guarda o resultado
 * numa cookie de vida curta so pra narrar "o que aconteceu hoje" logo
 * depois do redirect — o HistoricoProducao persistido (GDD secao 9) ja
 * existe e alimenta os KPIs do periodo; a cookie e so o feedback imediato
 * do ultimo clique.
 */
export async function avancarDia(loteId: string) {
  const resposta = await avancarDiaLote(loteId, {
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
