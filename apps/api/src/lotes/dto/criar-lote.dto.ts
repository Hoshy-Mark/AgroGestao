import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CriarLoteDto {
  @IsString()
  @MinLength(1)
  unidadeNegocioId!: string;

  @IsIn(["branca", "vermelha"])
  linhagem!: "branca" | "vermelha";

  @IsInt()
  @Min(1)
  quantidadeAvesAlojadas!: number;

  /** Permite criar um lote que ja nasce em producao (ex.: heranca — GDD secao 5), em vez de sempre comecar do zero em RECRIA. */
  @IsOptional()
  @IsInt()
  @Min(0)
  idadeDiasInicial?: number;
}
