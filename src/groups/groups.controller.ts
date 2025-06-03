import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }

  @ApiOperation({ 
      summary: 'Adiciona aluno ao grupo',
      description: 'Adiciona um aluno existente ao grupo, verificando se pertence à turma associada' 
    })
    @ApiParam({ name: 'groupId', type: Number, example: 1, description: 'ID do grupo' })
    @ApiParam({ name: 'userId', type: Number, example: 1, description: 'ID do aluno' })
    @ApiResponse({ status: 200, description: 'Aluno adicionado com sucesso' })
    @ApiResponse({ status: 400, description: 'Aluno já está no grupo ou não pertence à turma' })
    @ApiResponse({ status: 404, description: 'Grupo ou aluno não encontrado' })
    @Post(':groupId/alunos/:userId')
    async addAluno(
      @Param('groupId') groupId: string,
      @Param('userId') userId: string
    ) {
      return this.groupsService.addAluno(+groupId, +userId);
    }

  @ApiOperation({ 
    summary: 'Remove aluno do grupo',
    description: 'Remove um aluno específico de um grupo existente' 
  })
  @ApiParam({ name: 'groupId', type: Number, description: 'ID do grupo', example: 1 })
  @ApiParam({ name: 'userId', type: Number, description: 'ID do aluno a ser removido', example: 3 })
  @ApiResponse({ status: 200, description: 'Aluno removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Grupo não encontrado ou aluno não está no grupo' })
  @Delete(':groupId/alunos/:userId')
  async removeAluno(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string
  ) {
    return this.groupsService.removeAluno(+groupId, +userId);
  }
}