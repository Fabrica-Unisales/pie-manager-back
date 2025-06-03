import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe, 
  ParseBoolPipe,
  HttpCode,
  HttpStatus,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { TipoPerfil } from './entities/profile.entity';

@ApiTags('Perfis')
@Controller('perfis')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo perfil' })
  @ApiResponse({ 
    status: 201, 
    description: 'Perfil criado com sucesso',
    type: ProfileResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Perfil já existe' })
  async criarPerfil(@Body(ValidationPipe) createProfileDto: CreateProfileDto): Promise<ProfileResponseDto> {
    return this.profileService.criarPerfil(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os perfis' })
  @ApiQuery({ 
    name: 'incluirInativos', 
    required: false, 
    type: Boolean,
    description: 'Incluir perfis inativos na listagem'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de perfis',
    type: [ProfileResponseDto] 
  })
  async buscarTodosPerfis(
    @Query('incluirInativos', new ParseBoolPipe({ optional: true })) incluirInativos = false
  ): Promise<ProfileResponseDto[]> {
    return this.profileService.buscarTodosPerfis(incluirInativos);
  }

  @Get('tipo/:tipo')
  @ApiOperation({ summary: 'Buscar perfis por tipo' })
  @ApiParam({ name: 'tipo', enum: TipoPerfil })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de perfis do tipo especificado',
    type: [ProfileResponseDto] 
  })
  async buscarPerfisPorTipo(@Param('tipo') tipo: TipoPerfil): Promise<ProfileResponseDto[]> {
    return this.profileService.buscarPerfisPorTipo(tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar perfil por ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil encontrado',
    type: ProfileResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async buscarPerfilPorId(@Param('id', ParseIntPipe) id: number): Promise<ProfileResponseDto> {
    return this.profileService.buscarPerfilPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um perfil' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil atualizado com sucesso',
    type: ProfileResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito de nome' })
  async atualizarPerfil(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    return this.profileService.atualizarPerfil(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um perfil' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Perfil removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiResponse({ status: 400, description: 'Perfil possui usuários associados' })
  async removerPerfil(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.profileService.removerPerfil(id);
  }

  @Post(':id/permissoes')
  @ApiOperation({ summary: 'Atribuir permissões a um perfil' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Permissões atribuídas com sucesso',
    type: ProfileResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async atribuirPermissoes(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) assignPermissionsDto: AssignPermissionsDto
  ): Promise<ProfileResponseDto> {
    return this.profileService.atribuirPermissoes(id, assignPermissionsDto);
  }

  @Delete(':id/permissoes')
  @ApiOperation({ summary: 'Remover permissões de um perfil' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Permissões removidas com sucesso',
    type: ProfileResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async removerPermissoes(
    @Param('id', ParseIntPipe) id: number,
    @Body('permissaoIds') permissaoIds: number[]
  ): Promise<ProfileResponseDto> {
    return this.profileService.removerPermissoes(id, permissaoIds);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Ativar ou desativar um perfil' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status do perfil alterado com sucesso',
    type: ProfileResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async alterarStatusPerfil(
    @Param('id', ParseIntPipe) id: number,
    @Body('ativo', ParseBoolPipe) ativo: boolean
  ): Promise<ProfileResponseDto> {
    return this.profileService.ativarDesativarPerfil(id, ativo);
  }
}
