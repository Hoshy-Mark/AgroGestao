import { buscarHistoricoLote, listarDocumentos } from "@/lib/api";
import { carregarEmpresaAtual } from "@/lib/empresa";
import { EmConstrucao } from "@/components/EmConstrucao";
import styles from "./page.module.css";

interface Conceito {
  id: string;
  icone: string;
  nome: string;
  texto: string;
  pista: string;
}

/**
 * Codex de conhecimento (GDD secao 13): cada conceito e desbloqueado por uma
 * situacao concreta que o jogador viveu, nao por leitura. Nao existe uma
 * tabela de "eventos desbloqueados" separada — o desbloqueio e derivado do
 * estado que ja persistimos (historico, documentos, contratos, fornecedor,
 * lotes renovados), a mesma logica de "nao abstrair antes de precisar".
 */
const CONCEITOS: Conceito[] = [
  {
    id: "conversao-alimentar",
    icone: "🌾",
    nome: "Conversão alimentar",
    texto: "Quantos kg de ração viram uma dúzia de ovos — quanto menor, melhor. É a métrica central de eficiência de qualquer lote (Domain Bible §3.2).",
    pista: "Colete a primeira postura de ovos.",
  },
  {
    id: "capital-de-giro",
    icone: "💸",
    nome: "Capital de giro",
    texto: "Preço menor não significa custo menor: mesmo uma operação lucrativa no total pode fechar um dia específico no vermelho, dependendo do intervalo entre pagar e receber.",
    pista: "Feche um dia com resultado negativo.",
  },
  {
    id: "fornecedor-confiavel",
    icone: "🚚",
    nome: "Fornecedor barato vs. confiável",
    texto: "Ração mais barata nem sempre compensa — prazo de entrega e confiabilidade do fornecedor também pesam no resultado (Domain Bible §11.2).",
    pista: "Escolha um fornecedor de ração em Mercado.",
  },
  {
    id: "contrato-de-venda",
    icone: "🤝",
    nome: "Contrato de venda direta",
    texto: "Cliente de volume paga menos por dúzia; cliente pequeno paga mais mas compra bem menos — cada contrato é uma aposta comercial diferente (Domain Bible §15).",
    pista: "Feche um contrato em Comercial.",
  },
  {
    id: "trilha-fiscal",
    icone: "📄",
    nome: "Trilha de auditoria",
    texto: "Cada compra e venda gera um documento fiscal — a sequência completa deles é o histórico verificável da operação, sem precisar de um log à parte (Domain Bible §17-18).",
    pista: "Avance um dia com produção rodando.",
  },
  {
    id: "renovacao-plantel",
    icone: "🐣",
    nome: "Renovação de plantel",
    texto: "Depois do pico, a produção só cai — o custo de manter um lote velho deixa de compensar. Renovar cedo demais desperdiça postura ainda boa; tarde demais, desperdiça ração à toa.",
    pista: "Renove um plantel em Negócios.",
  },
];

export default async function CodexPage() {
  const { empresaCompleta, conectadoApi } = await carregarEmpresaAtual();

  if (!conectadoApi || !empresaCompleta) {
    return (
      <EmConstrucao
        titulo="Codex"
        texto="Assuma uma propriedade de verdade (com a API conectada) para começar a desbloquear conceitos — em modo demo não há progresso real."
      />
    );
  }

  const unidade = empresaCompleta.unidadesNegocio?.[0];
  const lote = unidade?.lotes?.[0];

  const [historicoLote, documentos] = await Promise.all([
    lote ? buscarHistoricoLote(lote.id).catch(() => []) : Promise.resolve([]),
    listarDocumentos(empresaCompleta.id).catch(() => []),
  ]);

  const desbloqueios: Record<string, boolean> = {
    "conversao-alimentar": historicoLote.some((r) => r.ovosProduzidos > 0),
    "capital-de-giro": historicoLote.some((r) => r.resultado < 0),
    "fornecedor-confiavel": !!unidade?.fornecedorRacaoId,
    "contrato-de-venda": (unidade?.contratos?.length ?? 0) > 0,
    "trilha-fiscal": documentos.length > 0,
    "renovacao-plantel": (unidade?._count?.lotes ?? 0) > 1,
  };

  const totalDesbloqueado = Object.values(desbloqueios).filter(Boolean).length;

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Codex</h2>
        <p className={styles.subtitulo}>
          Não é uma enciclopédia estática — cada conceito aqui foi
          desbloqueado por uma situação que você viveu jogando, não por
          leitura (GDD §13).
        </p>
        <div className={styles.progresso}>
          {totalDesbloqueado} / {CONCEITOS.length} conceitos descobertos
        </div>
      </div>

      <div className={styles.lista}>
        {CONCEITOS.map((conceito) => {
          const desbloqueado = desbloqueios[conceito.id] ?? false;
          return (
            <div key={conceito.id} className={styles.card} data-desbloqueado={desbloqueado}>
              <div className={styles.cardTopo}>
                <span className={styles.icone}>{desbloqueado ? conceito.icone : "🔒"}</span>
                <span className={styles.nome} data-desbloqueado={desbloqueado}>
                  {desbloqueado ? conceito.nome : "???"}
                </span>
              </div>
              <p className={styles.texto}>
                {desbloqueado ? conceito.texto : "Ainda não descoberto."}
              </p>
              {!desbloqueado && <p className={styles.pista}>{conceito.pista}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
