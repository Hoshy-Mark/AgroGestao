import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { criarEmpresaHerdada } from "@agrogestao/domain";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CriarEmpresaDto } from "./dto/criar-empresa.dto.js";
import { agregarHistorico } from "./historico-agregado.js";

/** "Mes" simulado = ultimos 30 dias avancados, nao um mes de calendario real. */
const DIAS_MES_SIMULADO = 30;

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cria a empresa a partir da herenca inicial (GDD secao 5), via packages/domain, e persiste. */
  criar(dto: CriarEmpresaDto) {
    const empresa = criarEmpresaHerdada({
      id: randomUUID(),
      nome: dto.nome,
      caixaInicial: dto.caixaInicial,
      dividaHerdada: dto.dividaHerdada,
      fundadaEm: new Date().toISOString(),
    });

    return this.prisma.empresa.create({
      data: {
        id: empresa.id,
        nome: empresa.nome,
        fundadaEm: new Date(empresa.fundadaEm),
        caixa: empresa.estado.caixa,
        divida: empresa.estado.divida,
        limiteCredito: empresa.estado.limiteCredito,
        reputacao: empresa.estado.reputacao,
        conhecimento: empresa.estado.conhecimento,
        diaAtual: empresa.estado.diaAtual,
      },
    });
  }

  listar() {
    return this.prisma.empresa.findMany({
      include: { unidadesNegocio: true },
    });
  }

  buscarPorId(id: string) {
    return this.prisma.empresa.findUniqueOrThrow({
      where: { id },
      include: {
        unidadesNegocio: {
          include: {
            lotes: { where: { ativo: true } },
            fornecedorRacao: true,
            contratos: { where: { ativo: true }, include: { cliente: true } },
            _count: { select: { lotes: true } },
          },
        },
      },
    });
  }

  /**
   * Resumo do "mes" (ultimos DIAS_MES_SIMULADO dias avancados, nao um mes de
   * calendario real) a partir do HistoricoProducao de todos os lotes da
   * empresa — a base do DRE (GDD secao 21.4).
   */
  async buscarHistoricoMensal(empresaId: string) {
    const registros = await this.prisma.historicoProducao.findMany({
      where: { lote: { unidadeNegocio: { empresaId } } },
      orderBy: { dia: "asc" },
    });

    const ultimoPeriodo = registros.slice(-DIAS_MES_SIMULADO);

    return {
      ...agregarHistorico(ultimoPeriodo),
      registros: ultimoPeriodo,
    };
  }
}
