import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ description: 'Module name', example: 'User Management' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Module description',
    example: 'This module handles user management functions',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Module code', example: 'USR-MGT' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description: 'Module active status',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'List of sub-modules', type: [CreateModuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  @IsOptional()
  subModules?: CreateModuleDto[];
}
