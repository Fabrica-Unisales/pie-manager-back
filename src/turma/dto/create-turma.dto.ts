import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateTurmaDto {
  @ApiProperty({ example: 'Turma 1' })
  @IsString()
  periodonome: string;
  @ApiProperty({ example: 'periodo' })
  @IsString()
  periodo: string;
  @ApiProperty({ example: 'Engenharia de software' })
  @IsString()
  curso: string;
}
