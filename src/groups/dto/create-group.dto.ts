import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'ID da Turma', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  turmaId: number;

  @ApiProperty({ description: 'IDs dos Alunos', example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  alunoIds: number[];

  @ApiProperty({ description: 'Tema do Grupo', example: 'IA na Educação' })
  @IsString()
  @IsNotEmpty()
  tema: string;

  @ApiProperty({ description: 'Descrição do Grupo', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ description: 'Status do Grupo', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}