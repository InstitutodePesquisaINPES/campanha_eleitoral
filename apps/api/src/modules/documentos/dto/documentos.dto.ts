import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateDocumentoDto {
  @IsUUID()
  @IsOptional()
  pessoaId?: string;

  @IsString()
  arquivoUrl!: string;

  @IsString()
  @IsOptional()
  tipoDocumento?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  tamanho?: number;
}
