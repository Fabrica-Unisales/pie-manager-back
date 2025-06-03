import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPerfil } from '../entities/profile.entity';

export class PermissionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  modulo: string;

  @ApiProperty()
  recurso: string;

  @ApiProperty()
  ativo: boolean;
}

export class ProfileResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiPropertyOptional()
  descricao?: string;

  @ApiProperty({ enum: TipoPerfil })
  tipo: TipoPerfil;

  @ApiProperty()
  ativo: boolean;

  @ApiProperty()
  nivelAcesso: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [PermissionResponseDto] })
  permissoes?: PermissionResponseDto[];

  @ApiPropertyOptional()
  totalUsuarios?: number;
} 