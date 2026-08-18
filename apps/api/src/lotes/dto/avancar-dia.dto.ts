import { IsNumber, IsOptional, Max, Min } from "class-validator";

/**
 * Parametros de mercado do dia simulado — espelha ParametrosMercadoDia de
 * packages/domain/src/engine/motorPostura.ts. Sem valores-padrao de servidor
 * de proposito: o Mercado (GDD secao 15) ainda nao existe como sistema, entao
 * hoje quem decide preco/mes/custo e quem chama o endpoint.
 */
export class AvancarDiaDto {
  @IsNumber()
  @Min(0)
  precoKgRacao!: number;

  @IsNumber()
  @Min(0)
  precoMedioDuzia!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  custoMaoDeObraMensal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  aliquotaFunrural?: number;
}
