import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

/**
 * Perfis de referencia (GDD secao 11.2: "fornecedor barato vs. confiavel").
 * Precos girando em torno da estimativa derivada de ~R$2,50/kg
 * (docs/GAME_ECONOMY.md secao 3), espalhados pra criar um trade-off real
 * entre preco, prazo de entrega e confiabilidade — nao um "melhor" unico.
 */
const FORNECEDORES_PADRAO = [
  {
    nome: "Ração Popular",
    precoKgRacao: 2.2,
    prazoPagamentoDias: 0,
    prazoEntregaDias: 5,
    confiabilidade: 55,
  },
  {
    nome: "Agropecuária Vale Verde",
    precoKgRacao: 2.6,
    prazoPagamentoDias: 30,
    prazoEntregaDias: 2,
    confiabilidade: 85,
  },
  {
    nome: "Cooperativa Regional",
    precoKgRacao: 2.45,
    prazoPagamentoDias: 15,
    prazoEntregaDias: 3,
    confiabilidade: 70,
  },
];

@Injectable()
export class FornecedoresService implements OnModuleInit {
  private readonly logger = new Logger(FornecedoresService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Semeia os fornecedores de referencia na primeira vez que a API sobe
   * contra um banco vazio — sem isso o jogador nunca teria opcao nenhuma de
   * fornecedor para escolher. Idempotente: so cria se a tabela estiver
   * vazia.
   */
  async onModuleInit() {
    try {
      const quantidade = await this.prisma.fornecedor.count();
      if (quantidade > 0) return;

      await this.prisma.fornecedor.createMany({ data: FORNECEDORES_PADRAO });
      this.logger.log(`Semeados ${FORNECEDORES_PADRAO.length} fornecedores de referência.`);
    } catch (erro) {
      // Banco pode nao estar acessivel ainda no boot (PrismaService conecta
      // sob demanda) — nao derruba a API por causa disso.
      this.logger.warn(
        `Não foi possível semear fornecedores agora (banco indisponível?): ${erro instanceof Error ? erro.message : erro}`
      );
    }
  }

  listar() {
    return this.prisma.fornecedor.findMany({ orderBy: { precoKgRacao: "asc" } });
  }
}
