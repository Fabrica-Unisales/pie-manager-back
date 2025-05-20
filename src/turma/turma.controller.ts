import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TurmaService } from './turma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';

@Controller('users')
export class TurmaController {
  constructor(private readonly TurmaService: TurmaService) {}

  @Post()
  create(@Body() CreateTurmaDto: CreateTurmaDto) {
    return this.TurmaService.create(CreateTurmaDto);
  }

  @Get()
  findAll() {
    return this.TurmaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.TurmaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateTurmaDto: UpdateTurmaDto) {
    return this.TurmaService.update(+id, UpdateTurmaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.TurmaService.remove(+id);
  }
}
