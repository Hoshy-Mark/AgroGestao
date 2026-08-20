import { IsNumber, IsOptional, Max, Min } from "class-validator";

/**
 * Parametros de mercado do dia simulado — espelha ParametrosMercadoDia de
 * packages/domain/src/engine/motorPostura.ts.
 */
export class AvancarDiaDto {
  /** Opcional: se omitido, o servico usa o Fornecedor de racao escolhido pela unidade (GDD secao 11.2), com fallback pro preco de referencia. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoKgRacao?: number;

  /** Opcional: se omitido, o servico usa o Contrato de venda ativo da unidade (Domain Bible secao 15), com fallback pro preco de referencia. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoMedioDuzia?: number;

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
