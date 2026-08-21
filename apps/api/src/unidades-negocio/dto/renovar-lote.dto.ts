import { IsIn, IsInt, Min } from "class-validator";

export class RenovarLoteDto {
  @IsIn(["branca", "vermelha"])
  linhagem!: "branca" | "vermelha";

  @IsInt()
  @Min(1)
  quantidadeAvesAlojadas!: number;
}
