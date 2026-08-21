"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { renovarLote } from "@/lib/api";

/** Renova o plantel (Domain Bible secao 2.3) com o mesmo perfil do lote herdado — linhagem branca, 1500 aves. */
export async function renovarPlantel(unidadeId: string) {
  await renovarLote(unidadeId, { linhagem: "branca", quantidadeAvesAlojadas: 1500 });
  revalidatePath("/negocios");
  revalidatePath("/");
  redirect("/negocios");
}
