import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateProjectDto {

    @ApiProperty({example: 'Ensalamento unisales'})
    @IsString()
    nome: string;

    @ApiProperty({example: '2'})
    @IsNumber()
    cursoId: number;

    @ApiProperty({example: '1'})
    @IsNumber()
    grupoId: number;

    @ApiProperty({example: '1'})
    @IsNumber()
    turmaId: number;

    @ApiProperty({example: '1'})
    @IsNumber()
    usuarioId: number;

    @ApiProperty({example: '6'})
    @IsString()
    periodo: string;
}
