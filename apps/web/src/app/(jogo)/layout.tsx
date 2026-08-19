import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { carregarEmpresaAtual } from "@/lib/empresa";
import styles from "./layout.module.css";

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/**
 * Layout de todas as telas "de dentro do jogo" (grupo de rotas (jogo),
 * nao afeta a URL) — carrega o resumo da empresa uma vez e da o chrome
 * (AppShell + banner de modo demo) pra qualquer pagina da sidebar.
 * /nova-empresa fica de fora de proposito, ela nao tem empresa ainda.
 */
export default async function JogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { empresa, conectadoApi, erroApi } = await carregarEmpresaAtual();

  return (
    <AppShell
      empresaNome={empresa.nome}
      dia={empresa.diaAtual}
      caixa={formatoMoeda.format(empresa.caixa)}
      reputacao={empresa.reputacao}
      conhecimento={empresa.conhecimento}
    >
      {!conectadoApi && (
        <section className={styles.demoBanner}>
          <span>
            {erroApi
              ? "Modo demo — não foi possível falar com a API (" + erroApi + ")."
              : "Modo demo — dados locais, ainda sem empresa criada na API."}
          </span>
          <Link className={styles.demoBannerLink} href="/nova-empresa">
            Assumir uma propriedade de verdade →
          </Link>
        </section>
      )}
      {children}
    </AppShell>
  );
}
