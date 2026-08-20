"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fecharContrato } from "@/lib/api";

/** Fecha um contrato de venda direta (Domain Bible secao 15) e volta pra tela de Comercial com o dado atualizado. */
export async function fecharContratoComCliente(unidadeId: string, clienteId: string) {
  await fecharContrato(unidadeId, clienteId);
  revalidatePath("/comercial");
  revalidatePath("/");
  redirect("/comercial");
}
