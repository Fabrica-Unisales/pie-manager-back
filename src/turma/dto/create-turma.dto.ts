import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTurmaDto {
  @ApiProperty({ example: 'Turma 2023/1' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Engenharia' })
  @IsString()
  @IsNotEmpty()
  curso: string;

  @ApiProperty({ example: 'T2023-1' })
  @IsString()
  @IsNotEmpty()
  codigo: string;
}