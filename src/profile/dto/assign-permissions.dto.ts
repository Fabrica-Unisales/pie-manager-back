import { IsArray, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'IDs das permissões a serem atribuídas',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsArray({ message: 'Permissões deve ser um array' })
  @IsNumber({}, { each: true, message: 'Cada permissão deve ser um número' })
  permissaoIds: number[];

  @ApiPropertyOptional({
    description: 'Data de expiração das permissões',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de expiração deve ser uma data válida' })
  dataExpiracao?: string;
} 