import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateProjectDto {

    @ApiProperty({example: 'Ensalamento unisales'})
    @IsString()
    nome: string;

    @ApiProperty({example: 'Engenharia de software'})
    @IsString()
    curso: string;

    @ApiProperty({example: '1'})
    @IsNumber()
    grupo: number;

    @ApiProperty({example: '6'})
    @IsNumber()
    periodo: number;
}
