import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class CriarEmpresaDto {
  @IsString()
  @MinLength(1)
  nome!: string;

  @IsNumber()
  caixaInicial!: number;

  @IsNumber()
  @Min(0)
  dividaHerdada!: number;
}
