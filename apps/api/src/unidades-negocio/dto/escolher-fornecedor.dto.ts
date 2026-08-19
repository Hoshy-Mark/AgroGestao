import { IsString, MinLength } from "class-validator";

export class EscolherFornecedorDto {
  @IsString()
  @MinLength(1)
  fornecedorId!: string;
}
