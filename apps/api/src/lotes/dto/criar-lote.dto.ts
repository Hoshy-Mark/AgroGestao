import { IsIn, IsInt, IsString, Min, MinLength } from "class-validator";

export class CriarLoteDto {
  @IsString()
  @MinLength(1)
  unidadeNegocioId!: string;

  @IsIn(["branca", "vermelha"])
  linhagem!: "branca" | "vermelha";

  @IsInt()
  @Min(1)
  quantidadeAvesAlojadas!: number;
}
