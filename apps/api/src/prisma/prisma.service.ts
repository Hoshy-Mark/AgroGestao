import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Sem $connect() no boot de proposito: o PrismaClient conecta sozinho, sob
 * demanda, na primeira query. Se conectasse eager aqui (onModuleInit), a
 * API inteira derrubava ao subir sem Postgres disponivel — nem o /health
 * respondia. Assim, a API sobe sempre; só os endpoints que tocam o banco
 * falham (com erro claro) enquanto o Postgres nao estiver acessivel.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    this.$connect().catch((erro: unknown) => {
      this.logger.warn(
        `Nao foi possivel conectar ao Postgres agora (a API segue no ar; endpoints que usam o banco vao falhar ate a conexao ficar disponivel): ${erro instanceof Error ? erro.message : erro}`
      );
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
