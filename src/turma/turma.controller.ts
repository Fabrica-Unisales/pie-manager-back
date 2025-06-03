import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { TurmaService } from './turma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Turmas')
@Controller('turmas')
export class TurmaController {
  constructor(private readonly turmaService: TurmaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova turma' })
  @ApiResponse({ status: 201, description: 'Turma criada com sucesso.' })
  create(@Body() createTurmaDto: CreateTurmaDto) {
    return this.turmaService.create(createTurmaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as turmas' })
  @ApiResponse({ status: 200, description: 'Lista de turmas retornada com sucesso.' })
  findAll() {
    return this.turmaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma turma pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Turma encontrada.' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.turmaService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados da turma' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTurmaDto })
  update(@Param('id') id: string, @Body() updateTurmaDto: UpdateTurmaDto) {
    return this.turmaService.update(+id, updateTurmaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover turma pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.turmaService.remove(+id);
  }

  @Put(':id/alunos')
  @ApiOperation({ summary: 'Adicionar ou remover alunos de uma turma' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        add: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2],
        },
        remove: {
          type: 'array',
          items: { type: 'number' },
          example: [3],
        },
      },
    },
  })
  atualizarAlunos(
    @Param('id') id: string,
    @Body() body: { add?: number[]; remove?: number[] },
  ) {
    return this.turmaService.updateAlunosNaTurma(+id, body);
  }
}