import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Module ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  idModule: number;

  @ApiProperty({ description: 'Permission ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  idPermission: number;

  @ApiProperty({ description: 'Permission code', example: 'READ_USER' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Allows reading user data',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Permission name', example: 'Read User' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
