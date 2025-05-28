import { ApiProperty } from '@nestjs/swagger';

export class CreateCursoDto {
  @ApiProperty()
  nome: string;

  @ApiProperty()
  descricao: string;
}
