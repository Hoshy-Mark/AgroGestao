"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { avancarDiaLote } from "@/lib/api";

/**
 * Roda um dia do MotorPostura sobre o lote (via API) e guarda o resultado
 * numa cookie de vida curta so pra narrar "o que aconteceu hoje" logo
 * depois do redirect — o HistoricoProducao persistido (GDD secao 9) ja
 * existe e alimenta os KPIs do periodo; a cookie e so o feedback imediato
 * do ultimo clique.
 *
 * Nem preco de racao nem preco de venda entram aqui: o servico deriva do
 * Fornecedor escolhido em /mercado e do Contrato ativo em /comercial,
 * cada um com fallback pro preco de referencia se o jogador ainda nao
 * decidiu nenhum dos dois.
 */
export async function avancarDia(loteId: string) {
  const resposta = await avancarDiaLote(loteId);

  (await cookies()).set("ultimoResultado", JSON.stringify(resposta.resultado), {
    path: "/",
    maxAge: 5,
  });

  // Sem isso o Next reaproveita o Router Cache da renderizacao anterior de
  // "/" e mostra caixa/dia desatualizados apos o redirect.
  revalidatePath("/");
  redirect("/");
}
