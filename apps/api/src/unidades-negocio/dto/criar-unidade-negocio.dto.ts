import { IsIn, IsInt, IsString, Min, MinLength } from "class-validator";

export class CriarUnidadeNegocioDto {
  @IsString()
  @MinLength(1)
  empresaId!: string;

  @IsString()
  @MinLength(1)
  nome!: string;

  @IsIn(["matriz", "poedeira"])
  tipo!: "matriz" | "poedeira";

  @IsInt()
  @Min(1)
  capacidadeAves!: number;
}
