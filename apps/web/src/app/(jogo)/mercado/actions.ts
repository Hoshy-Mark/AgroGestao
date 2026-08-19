"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { escolherFornecedorRacao } from "@/lib/api";

/** Troca o fornecedor de ração da unidade (GDD secao 11.2) e volta pra tela de Mercado com o dado atualizado. */
export async function escolherFornecedor(unidadeId: string, fornecedorId: string) {
  await escolherFornecedorRacao(unidadeId, fornecedorId);
  revalidatePath("/mercado");
  revalidatePath("/");
  redirect("/mercado");
}
