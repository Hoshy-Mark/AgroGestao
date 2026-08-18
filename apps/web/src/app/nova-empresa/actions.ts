"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, criarEmpresa } from "@/lib/api";

export interface EstadoAssumirHeranca {
  erro?: string;
}

/**
 * Cria a empresa herdada (GDD secao 5) via API e guarda o id numa cookie —
 * ainda nao existe autenticacao/multiplayer, entao "sessao" por enquanto e
 * so "qual empresa este navegador esta jogando".
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

  redirect("/");
}
