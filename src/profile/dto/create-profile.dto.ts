import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsInt, Min, Max, Length, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPerfil } from '../entities/profile.entity';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Nome do perfil',
    example: 'Administrador do Sistema',
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  nome: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do perfil',
    example: 'Perfil com acesso total ao sistema'
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @ApiProperty({
    description: 'Tipo do perfil',
    enum: TipoPerfil,
    example: TipoPerfil.ADMINISTRADOR
  })
  @IsEnum(TipoPerfil, { message: 'Tipo deve ser um valor válido' })
  tipo: TipoPerfil;

  @ApiPropertyOptional({
    description: 'Status ativo do perfil',
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'Nível de acesso (0-100)',
    minimum: 0,
    maximum: 100,
    default: 0
  })
  @IsOptional()
  @IsInt({ message: 'Nível de acesso deve ser um número inteiro' })
  @Min(0, { message: 'Nível de acesso deve ser no mínimo 0' })
  @Max(100, { message: 'Nível de acesso deve ser no máximo 100' })
  nivelAcesso?: number;

  @ApiPropertyOptional({
    description: 'IDs das permissões associadas ao perfil',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsOptional()
  @IsArray({ message: 'Permissões deve ser um array' })
  @IsNumber({}, { each: true, message: 'Cada permissão deve ser um número' })
  permissaoIds?: number[];
}
