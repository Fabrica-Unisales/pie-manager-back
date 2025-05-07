import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ description: 'Module ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  idModule: number;

  @ApiProperty({ description: 'Module name', example: 'User Management' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Module description',
    example: 'This module handles user management functions',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Module code', example: 'USR-MGT' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ description: 'List of sub-modules', type: [CreateModuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  @IsOptional()
  subModules: CreateModuleDto[];

  @ApiProperty({
    description: 'Module active status',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
