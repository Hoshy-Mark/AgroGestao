import { IsString, MinLength } from "class-validator";

export class CriarContratoDto {
  @IsString()
  @MinLength(1)
  unidadeNegocioId!: string;

  @IsString()
  @MinLength(1)
  clienteId!: string;
}
