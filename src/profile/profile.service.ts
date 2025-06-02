import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Profile, TipoPerfil } from './entities/profile.entity';
import { Permission } from '../permission/entities/permission.entity';
import { ProfilePermission } from './entities/profile-permission.entity';
import { User } from '../users/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile)
    private readonly perfilModel: typeof Profile,
    @InjectModel(Permission)
    private readonly permissaoModel: typeof Permission,
    @InjectModel(ProfilePermission)
    private readonly perfilPermissaoModel: typeof ProfilePermission,
    @InjectModel(User)
    private readonly usuarioModel: typeof User,
    private readonly sequelize: Sequelize,
  ) {}

  async criarPerfil(createProfileDto: CreateProfileDto): Promise<ProfileResponseDto> {
    const transaction = await this.sequelize.transaction();
    
    try {
      // Verificar se já existe um perfil com o mesmo nome
      const perfilExistente = await this.perfilModel.findOne({
        where: { nome: createProfileDto.nome }
      });

      if (perfilExistente) {
        throw new ConflictException('Já existe um perfil com este nome');
      }

      // Validar nível de acesso baseado no tipo
      this.validarNivelAcessoPorTipo(createProfileDto.tipo, createProfileDto.nivelAcesso);

      // Criar o perfil
      const novoPerfil = await this.perfilModel.create({
        nome: createProfileDto.nome,
        descricao: createProfileDto.descricao,
        tipo: createProfileDto.tipo,
        ativo: createProfileDto.ativo ?? true,
        nivelAcesso: createProfileDto.nivelAcesso ?? this.obterNivelAcessoPadrao(createProfileDto.tipo)
      }, { transaction });

      // Associar permissões se fornecidas
      if (createProfileDto.permissaoIds && createProfileDto.permissaoIds.length > 0) {
        await this.associarPermissoes(novoPerfil.id, createProfileDto.permissaoIds, transaction);
      }

      await transaction.commit();

      return this.buscarPerfilPorId(novoPerfil.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async buscarTodosPerfis(incluirInativos = false): Promise<ProfileResponseDto[]> {
    const whereClause = incluirInativos ? {} : { ativo: true };

    const perfis = await this.perfilModel.findAll({
      where: whereClause,
      include: [
        {
          model: Permission,
          as: 'permissoes',
          through: { attributes: [] }
        }
      ],
      order: [['nome', 'ASC']]
    });

    return Promise.all(perfis.map(perfil => this.mapearParaResponse(perfil)));
  }

  async buscarPerfilPorId(id: number): Promise<ProfileResponseDto> {
    const perfil = await this.perfilModel.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissoes',
          through: { attributes: [] }
        }
      ]
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    return this.mapearParaResponse(perfil);
  }

  async atualizarPerfil(id: number, updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const transaction = await this.sequelize.transaction();

    try {
      const perfil = await this.perfilModel.findByPk(id);
      
      if (!perfil) {
        throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
      }

      // Verificar conflito de nome se estiver sendo alterado
      if (updateProfileDto.nome && updateProfileDto.nome !== perfil.nome) {
        const perfilExistente = await this.perfilModel.findOne({
          where: { 
            nome: updateProfileDto.nome,
            id: { [Op.ne]: id }
          }
        });

        if (perfilExistente) {
          throw new ConflictException('Já existe um perfil com este nome');
        }
      }

      // Validar nível de acesso se estiver sendo alterado
      if (updateProfileDto.tipo || updateProfileDto.nivelAcesso !== undefined) {
        const novoTipo = updateProfileDto.tipo || perfil.tipo;
        const novoNivel = updateProfileDto.nivelAcesso ?? perfil.nivelAcesso;
        this.validarNivelAcessoPorTipo(novoTipo, novoNivel);
      }

      // Atualizar o perfil
      await perfil.update(updateProfileDto, { transaction });

      // Atualizar permissões se fornecidas
      if (updateProfileDto.permissaoIds !== undefined) {
        await this.atualizarPermissoesPerfil(id, updateProfileDto.permissaoIds, transaction);
      }

      await transaction.commit();

      return this.buscarPerfilPorId(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removerPerfil(id: number): Promise<void> {
    const transaction = await this.sequelize.transaction();

    try {
      const perfil = await this.perfilModel.findByPk(id);
      
      if (!perfil) {
        throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
      }

      // Verificar se há usuários associados
      const usuariosAssociados = await this.usuarioModel.count({
        where: { perfilId: id }
      });

      if (usuariosAssociados > 0) {
        throw new BadRequestException(
          `Não é possível remover o perfil. Existem ${usuariosAssociados} usuário(s) associado(s)`
        );
      }

      // Remover associações de permissões
      await this.perfilPermissaoModel.destroy({
        where: { perfilId: id },
        transaction
      });

      // Remover o perfil (soft delete)
      await perfil.destroy({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async atribuirPermissoes(id: number, assignPermissionsDto: AssignPermissionsDto): Promise<ProfileResponseDto> {
    const transaction = await this.sequelize.transaction();

    try {
      const perfil = await this.perfilModel.findByPk(id);
      
      if (!perfil) {
        throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
      }

      await this.associarPermissoes(
        id, 
        assignPermissionsDto.permissaoIds, 
        transaction,
        assignPermissionsDto.dataExpiracao ? new Date(assignPermissionsDto.dataExpiracao) : undefined
      );

      await transaction.commit();

      return this.buscarPerfilPorId(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removerPermissoes(id: number, permissaoIds: number[]): Promise<ProfileResponseDto> {
    const perfil = await this.perfilModel.findByPk(id);
    
    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    await this.perfilPermissaoModel.destroy({
      where: {
        perfilId: id,
        permissaoId: { [Op.in]: permissaoIds }
      }
    });

    return this.buscarPerfilPorId(id);
  }

  async buscarPerfisPorTipo(tipo: TipoPerfil): Promise<ProfileResponseDto[]> {
    const perfis = await this.perfilModel.findAll({
      where: { tipo, ativo: true },
      include: [
        {
          model: Permission,
          as: 'permissoes',
          through: { attributes: [] }
        }
      ],
      order: [['nome', 'ASC']]
    });

    return Promise.all(perfis.map(perfil => this.mapearParaResponse(perfil)));
  }

  async ativarDesativarPerfil(id: number, ativo: boolean): Promise<ProfileResponseDto> {
    const perfil = await this.perfilModel.findByPk(id);
    
    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    await perfil.update({ ativo });

    return this.buscarPerfilPorId(id);
  }

  // Métodos privados auxiliares
  private validarNivelAcessoPorTipo(tipo: TipoPerfil, nivelAcesso?: number): void {
    if (nivelAcesso === undefined) return;

    const limitesNivel = {
      [TipoPerfil.ADMINISTRADOR]: { min: 80, max: 100 },
      [TipoPerfil.COORDENADOR]: { min: 60, max: 90 },
      [TipoPerfil.PROFESSOR]: { min: 30, max: 70 },
      [TipoPerfil.SECRETARIO]: { min: 20, max: 60 },
      [TipoPerfil.ALUNO]: { min: 0, max: 30 }
    };

    const limite = limitesNivel[tipo];
    if (nivelAcesso < limite.min || nivelAcesso > limite.max) {
      throw new BadRequestException(
        `Nível de acesso para ${tipo} deve estar entre ${limite.min} e ${limite.max}`
      );
    }
  }

  private obterNivelAcessoPadrao(tipo: TipoPerfil): number {
    const niveisPadrao = {
      [TipoPerfil.ADMINISTRADOR]: 100,
      [TipoPerfil.COORDENADOR]: 75,
      [TipoPerfil.PROFESSOR]: 50,
      [TipoPerfil.SECRETARIO]: 40,
      [TipoPerfil.ALUNO]: 10
    };

    return niveisPadrao[tipo];
  }

  private async associarPermissoes(
    perfilId: number, 
    permissaoIds: number[], 
    transaction: Transaction,
    dataExpiracao?: Date
  ): Promise<void> {
    // Verificar se todas as permissões existem
    const permissoesExistentes = await this.permissaoModel.findAll({
      where: { id: { [Op.in]: permissaoIds } }
    });

    if (permissoesExistentes.length !== permissaoIds.length) {
      const idsEncontrados = permissoesExistentes.map(p => p.id);
      const idsNaoEncontrados = permissaoIds.filter(id => !idsEncontrados.includes(id));
      throw new NotFoundException(`Permissões não encontradas: ${idsNaoEncontrados.join(', ')}`);
    }

    // Criar associações
    const associacoes = permissaoIds.map(permissaoId => ({
      perfilId,
      permissaoId,
      dataConcessao: new Date(),
      dataExpiracao,
      ativo: true
    }));

    await this.perfilPermissaoModel.bulkCreate(associacoes, { 
      transaction,
      ignoreDuplicates: true 
    });
  }

  private async atualizarPermissoesPerfil(
    perfilId: number, 
    novasPermissaoIds: number[], 
    transaction: Transaction
  ): Promise<void> {
    // Remover todas as permissões atuais
    await this.perfilPermissaoModel.destroy({
      where: { perfilId },
      transaction
    });

    // Adicionar as novas permissões
    if (novasPermissaoIds.length > 0) {
      await this.associarPermissoes(perfilId, novasPermissaoIds, transaction);
    }
  }

  private async mapearParaResponse(perfil: Profile): Promise<ProfileResponseDto> {
    const totalUsuarios = await this.usuarioModel.count({
      where: { perfilId: perfil.id }
    });

    return {
      id: perfil.id,
      nome: perfil.nome,
      descricao: perfil.descricao,
      tipo: perfil.tipo,
      ativo: perfil.ativo,
      nivelAcesso: perfil.nivelAcesso,
      createdAt: perfil.createdAt,
      updatedAt: perfil.updatedAt,
      permissoes: perfil.permissoes?.map(permissao => ({
        id: permissao.id,
        nome: permissao.nome,
        descricao: permissao.descricao,
        tipo: permissao.tipo,
        modulo: permissao.modulo,
        recurso: permissao.recurso,
        ativo: permissao.ativo
      })),
      totalUsuarios
    };
  }
}
