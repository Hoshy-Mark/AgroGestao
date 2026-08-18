/**
 * Documentos fiscais ficticios (Domain Bible secoes 17-18): cada transacao
 * do jogo nasce como um documento tipado, e a sequencia cronologica desses
 * documentos por empresa E a trilha de auditoria — sem precisar de um log
 * generico paralelo.
 *
 * Numeros e chaves aqui sao decorativos (imitam o formato de uma NF-e para
 * dar autenticidade visual) e nao tem nenhuma validade fiscal real.
 */

export type TipoDocumentoFiscal =
  | "NOTA_ENTRADA_COMPRA" // compra de racao, pintainhas, insumos (Domain Bible 10)
  | "NOTA_VENDA_DIRETA" // venda por contrato direto (Domain Bible 15)
  | "NOTA_REMESSA_CONSIGNACAO" // saida para consignatario (Domain Bible 16)
  | "NOTA_VENDA_CONSIGNACAO" // liquidacao do que o consignatario vendeu
  | "NOTA_DEVOLUCAO_CONSIGNACAO" // retorno do que nao foi vendido
  | "NOTA_ACERTO_INTEGRACAO" // liquidacao periodica de contrato de integracao (Domain Bible 7.3)
  | "NOTA_DESCARTE_LOTE" // venda de aves de descarte ao fim do ciclo (Domain Bible 2.3)
  | "NOTA_TRANSPORTE"; // frete de animais vivos (Domain Bible 8), opcional

export type StatusDocumentoFiscal = "EMITIDO" | "CANCELADO";

export interface ItemDocumentoFiscal {
  descricao: string; // ex.: "Racao fase producao 40kg", "Ovos classe extra (caixa 30dz)"
  quantidade: number;
  unidade: string; // "kg", "duzia", "caixa30dz", "ave"
  valorUnitario: number;
  valorTotal: number;
}

export interface ReferenciaDocumentoFiscal {
  /** Liga ao PedidoCompra, Contrato, Lote etc. de origem da transacao. */
  transacaoId: string;
  contratoId?: string;
  loteId?: string;
}

export interface DocumentoFiscal {
  id: string;
  numero: number; // sequencial por serie, ficticio
  serie: number; // 1 serie por tipo de documento, simplificado
  tipo: TipoDocumentoFiscal;
  status: StatusDocumentoFiscal;
  dataEmissao: string; // ISO 8601, data simulada do jogo
  emitenteId: string;
  destinatarioId: string;
  itens: ItemDocumentoFiscal[];
  valorTotal: number;
  chaveFicticia: string;
  referencia: ReferenciaDocumentoFiscal;
}

/**
 * Gera uma "chave" decorativa que imita o formato de uma chave de acesso de
 * NF-e apenas para dar autenticidade visual a UI — nao tem validade fiscal.
 */
function gerarChaveFicticia(
  numero: number,
  serie: number,
  tipo: TipoDocumentoFiscal
): string {
  const base = `${serie}`.padStart(3, "0") + `${numero}`.padStart(9, "0");
  const hashTipo = tipo.length.toString().padStart(2, "0");
  return `FIC-${base}-${hashTipo}-0000`;
}

/**
 * Numeracao: uma sequencia independente por tipo de documento. Em produção
 * essa contagem deve ser persistida junto ao estado da empresa (equivalente
 * a um contador por serie) — aqui e so a logica pura.
 */
export class NumeradorDocumentoFiscal {
  private contadores = new Map<TipoDocumentoFiscal, number>();

  proximoNumero(tipo: TipoDocumentoFiscal): number {
    const atual = this.contadores.get(tipo) ?? 0;
    const proximo = atual + 1;
    this.contadores.set(tipo, proximo);
    return proximo;
  }
}

export interface EmitirDocumentoFiscalParams {
  tipo: TipoDocumentoFiscal;
  emitenteId: string;
  destinatarioId: string;
  itens: ItemDocumentoFiscal[];
  dataEmissao: string;
  referencia: ReferenciaDocumentoFiscal;
  serie?: number;
  gerarId?: () => string;
}

const gerarIdPadrao = () =>
  `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

/**
 * Fabrica central: toda transacao financeira do motor deveria passar por
 * aqui para nascer ja como documento fiscal — e isso que forma a trilha de
 * auditoria (Domain Bible 17-18).
 */
export class FabricaDocumentoFiscal {
  constructor(private readonly numerador: NumeradorDocumentoFiscal) {}

  emitir(params: EmitirDocumentoFiscalParams): DocumentoFiscal {
    const serie = params.serie ?? 1;
    const numero = this.numerador.proximoNumero(params.tipo);
    const valorTotal = params.itens.reduce(
      (soma, item) => soma + item.valorTotal,
      0
    );
    const gerarId = params.gerarId ?? gerarIdPadrao;

    return {
      id: gerarId(),
      numero,
      serie,
      tipo: params.tipo,
      status: "EMITIDO",
      dataEmissao: params.dataEmissao,
      emitenteId: params.emitenteId,
      destinatarioId: params.destinatarioId,
      itens: params.itens,
      valorTotal,
      chaveFicticia: gerarChaveFicticia(numero, serie, params.tipo),
      referencia: params.referencia,
    };
  }

  cancelar(doc: DocumentoFiscal): DocumentoFiscal {
    return { ...doc, status: "CANCELADO" };
  }
}

/**
 * A trilha de auditoria (GDD secao 11.6) e simplesmente a lista ordenada de
 * documentos emitidos por uma empresa — sem estrutura de log paralela. A
 * interface fica no dominio; a implementacao concreta (Prisma, em memoria,
 * etc.) vive na camada que a consome.
 */
export interface RepositorioAuditoriaFiscal {
  registrar(doc: DocumentoFiscal): Promise<void>;
  listarPorPeriodo(
    empresaId: string,
    inicio: string,
    fim: string
  ): Promise<DocumentoFiscal[]>;
  listarPorTipo(
    empresaId: string,
    tipo: TipoDocumentoFiscal
  ): Promise<DocumentoFiscal[]>;
  buscarPorReferencia(transacaoId: string): Promise<DocumentoFiscal[]>;
}
