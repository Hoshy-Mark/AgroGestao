"use client";

import { useFormState, useFormStatus } from "react-dom";
import { assumirHeranca, type EstadoAssumirHeranca } from "./actions";
import styles from "./page.module.css";

const ESTADO_INICIAL: EstadoAssumirHeranca = {};

function BotaoAssumir() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.botao} type="submit" disabled={pending}>
      {pending ? "Assumindo a propriedade..." : "Assumir a propriedade herdada"}
    </button>
  );
}

export default function NovaEmpresaPage() {
  const [estado, formAction] = useFormState(assumirHeranca, ESTADO_INICIAL);

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.titulo}>Você herdou uma propriedade rural</h1>
        <p className={styles.texto}>
          Seu avô deixou uma pequena granja, alguns fornecedores e clientes
          antigos, um funcionário que já trabalhava ali — e algumas dívidas
          que você ainda não sabe se dão pra pagar.
        </p>
        <p className={styles.texto}>
          Você não começa sabendo administrar uma empresa. Você aprende
          administrando a empresa.
        </p>

        <div className={styles.resumo}>
          <div className={styles.resumoItem}>
            <div className={styles.resumoLabel}>Caixa inicial</div>
            <div className={styles.resumoValor}>R$ 8.000</div>
          </div>
          <div className={styles.resumoItem}>
            <div className={styles.resumoLabel}>Dívida herdada</div>
            <div className={styles.resumoValor}>R$ 15.000</div>
          </div>
        </div>

        <form action={formAction}>
          <BotaoAssumir />
        </form>

        {estado.erro && (
          <div className={styles.erro}>
            Não foi possível conectar com a API: {estado.erro}
            <br />
            Verifique se <code>apps/api</code> está rodando (
            <code>npm run dev:api</code>) e com um Postgres acessível.
          </div>
        )}
      </div>
    </main>
  );
}
