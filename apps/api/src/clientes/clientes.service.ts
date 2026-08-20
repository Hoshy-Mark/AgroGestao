import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

/**
 * Perfis de referencia (GDD secao 14/16: canal de volume/distribuidor vs.
 * canal direto/pequeno). Precos ancorados na reconciliacao de fontes de
 * docs/GAME_ECONOMY.md secao 5: faixa Cepea (~R$3-7,50/duzia, canal de
 * distribuidor/volume) vs. referencia EMATER-DF de venda direta pequena
 * (~R$12/duzia, aqui moderada pra baixo por ser um cliente fixo, nao spot).
 */
const CLIENTES_PADRAO = [
  {
    nome: "Distribuidora Ovos do Vale",
    relacionamento: 40,
    confianca: 70,
    sensibilidadePreco: 80,
    prazoMedioDias: 30,
    precoOfertadoDuzia: 4.0,
    volumeMensalDuzias: 1200,
  },
  {
    nome: "Mercado São José",
    relacionamento: 60,
    confianca: 55,
    sensibilidadePreco: 50,
    prazoMedioDias: 15,
    precoOfertadoDuzia: 5.5,
    volumeMensalDuzias: 300,
  },
  {
    nome: "Padaria Trigo Dourado",
    relacionamento: 50,
    confianca: 60,
    sensibilidadePreco: 35,
    prazoMedioDias: 7,
    precoOfertadoDuzia: 6.2,
    volumeMensalDuzias: 150,
  },
];

@Injectable()
export class ClientesService implements OnModuleInit {
  private readonly logger = new Logger(ClientesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Mesma logica de FornecedoresService: semeia so se a tabela estiver vazia, sem derrubar a API se o banco nao estiver acessivel ainda. */
  async onModuleInit() {
    try {
      const quantidade = await this.prisma.cliente.count();
      if (quantidade > 0) return;

      await this.prisma.cliente.createMany({ data: CLIENTES_PADRAO });
      this.logger.log(`Semeados ${CLIENTES_PADRAO.length} clientes de referência.`);
    } catch (erro) {
      this.logger.warn(
        `Não foi possível semear clientes agora (banco indisponível?): ${erro instanceof Error ? erro.message : erro}`
      );
    }
  }

  listar() {
    return this.prisma.cliente.findMany({ orderBy: { precoOfertadoDuzia: "desc" } });
  }
}
