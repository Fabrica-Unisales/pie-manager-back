import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { ProfileService } from './profile.service';
import { Profile, TipoPerfil } from './entities/profile.entity';
import { Permission } from '../permission/entities/permission.entity';
import { ProfilePermission } from './entities/profile-permission.entity';
import { User } from '../users/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileModel: typeof Profile;
  let permissionModel: typeof Permission;
  let profilePermissionModel: typeof ProfilePermission;
  let userModel: typeof User;
  let sequelize: Sequelize;

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  };

  const mockProfile = {
    id: 1,
    nome: 'Administrador',
    descricao: 'Perfil administrativo',
    tipo: TipoPerfil.ADMINISTRADOR,
    ativo: true,
    nivelAcesso: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissoes: [],
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockProfileModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  const mockPermissionModel = {
    findAll: jest.fn(),
  };

  const mockProfilePermissionModel = {
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
  };

  const mockUserModel = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getModelToken(Profile),
          useValue: mockProfileModel,
        },
        {
          provide: getModelToken(Permission),
          useValue: mockPermissionModel,
        },
        {
          provide: getModelToken(ProfilePermission),
          useValue: mockProfilePermissionModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    profileModel = module.get<typeof Profile>(getModelToken(Profile));
    permissionModel = module.get<typeof Permission>(getModelToken(Permission));
    profilePermissionModel = module.get<typeof ProfilePermission>(getModelToken(ProfilePermission));
    userModel = module.get<typeof User>(getModelToken(User));
    sequelize = module.get<Sequelize>(Sequelize);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('criarPerfil', () => {
    const createProfileDto: CreateProfileDto = {
      nome: 'Novo Perfil',
      descricao: 'Descrição do perfil',
      tipo: TipoPerfil.PROFESSOR,
      ativo: true,
      nivelAcesso: 50,
      permissaoIds: [1, 2],
    };

    it('deve criar um perfil com sucesso', async () => {
      mockProfileModel.findOne.mockResolvedValue(null);
      mockProfileModel.create.mockResolvedValue({ id: 1, ...createProfileDto });
      mockPermissionModel.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockProfilePermissionModel.bulkCreate.mockResolvedValue([]);
      mockUserModel.count.mockResolvedValue(0);

      jest.spyOn(service, 'buscarPerfilPorId').mockResolvedValue({
        id: 1,
        nome: createProfileDto.nome,
        descricao: createProfileDto.descricao,
        tipo: createProfileDto.tipo,
        ativo: createProfileDto.ativo ?? true,
        nivelAcesso: createProfileDto.nivelAcesso ?? 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissoes: [],
        totalUsuarios: 0,
      });

      const resultado = await service.criarPerfil(createProfileDto);

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({
        where: { nome: createProfileDto.nome }
      });
      expect(mockProfileModel.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultado.nome).toBe(createProfileDto.nome);
    });

    it('deve lançar ConflictException se perfil já existir', async () => {
      mockProfileModel.findOne.mockResolvedValue(mockProfile);

      await expect(service.criarPerfil(createProfileDto)).rejects.toThrow(ConflictException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('deve validar nível de acesso por tipo', async () => {
      const invalidDto = {
        ...createProfileDto,
        tipo: TipoPerfil.ALUNO,
        nivelAcesso: 50, // Inválido para aluno (deve ser 0-30)
      };

      mockProfileModel.findOne.mockResolvedValue(null);

      await expect(service.criarPerfil(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('buscarTodosPerfis', () => {
    it('deve retornar todos os perfis ativos por padrão', async () => {
      mockProfileModel.findAll.mockResolvedValue([mockProfile]);
      mockUserModel.count.mockResolvedValue(5);

      const resultado = await service.buscarTodosPerfis();

      expect(mockProfileModel.findAll).toHaveBeenCalledWith({
        where: { ativo: true },
        include: expect.any(Array),
        order: [['nome', 'ASC']]
      });
      expect(resultado).toHaveLength(1);
    });

    it('deve incluir perfis inativos quando solicitado', async () => {
      mockProfileModel.findAll.mockResolvedValue([mockProfile]);
      mockUserModel.count.mockResolvedValue(0);

      await service.buscarTodosPerfis(true);

      expect(mockProfileModel.findAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['nome', 'ASC']]
      });
    });
  });

  describe('buscarPerfilPorId', () => {
    it('deve retornar perfil quando encontrado', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockUserModel.count.mockResolvedValue(3);

      const resultado = await service.buscarPerfilPorId(1);

      expect(mockProfileModel.findByPk).toHaveBeenCalledWith(1, {
        include: expect.any(Array)
      });
      expect(resultado.id).toBe(1);
      expect(resultado.totalUsuarios).toBe(3);
    });

    it('deve lançar NotFoundException quando perfil não encontrado', async () => {
      mockProfileModel.findByPk.mockResolvedValue(null);

      await expect(service.buscarPerfilPorId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizarPerfil', () => {
    const updateDto: UpdateProfileDto = {
      nome: 'Nome Atualizado',
      nivelAcesso: 90,
    };

    it('deve atualizar perfil com sucesso', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockProfileModel.findOne.mockResolvedValue(null);
      mockProfile.update.mockResolvedValue(mockProfile);

      jest.spyOn(service, 'buscarPerfilPorId').mockResolvedValue({
        ...mockProfile,
        nome: updateDto.nome,
        nivelAcesso: updateDto.nivelAcesso,
        totalUsuarios: 0,
      } as any);

      const resultado = await service.atualizarPerfil(1, updateDto);

      expect(mockProfile.update).toHaveBeenCalledWith(updateDto, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultado.nome).toBe(updateDto.nome);
    });

    it('deve lançar ConflictException se nome já existir', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockProfileModel.findOne.mockResolvedValue({ id: 2, nome: updateDto.nome });

      await expect(service.atualizarPerfil(1, updateDto)).rejects.toThrow(ConflictException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('removerPerfil', () => {
    it('deve remover perfil quando não há usuários associados', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockUserModel.count.mockResolvedValue(0);
      mockProfile.destroy.mockResolvedValue(undefined);
      mockProfilePermissionModel.destroy.mockResolvedValue(undefined);

      await service.removerPerfil(1);

      expect(mockProfilePermissionModel.destroy).toHaveBeenCalledWith({
        where: { perfilId: 1 },
        transaction: mockTransaction
      });
      expect(mockProfile.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se há usuários associados', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockUserModel.count.mockResolvedValue(5);

      await expect(service.removerPerfil(1)).rejects.toThrow(BadRequestException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('atribuirPermissoes', () => {
    const assignDto: AssignPermissionsDto = {
      permissaoIds: [1, 2, 3],
      dataExpiracao: '2024-12-31T23:59:59.000Z',
    };

    it('deve atribuir permissões com sucesso', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockPermissionModel.findAll.mockResolvedValue([
        { id: 1 }, { id: 2 }, { id: 3 }
      ]);
      mockProfilePermissionModel.bulkCreate.mockResolvedValue([]);

      jest.spyOn(service, 'buscarPerfilPorId').mockResolvedValue({
        ...mockProfile,
        permissoes: [{ id: 1 }, { id: 2 }, { id: 3 }],
        totalUsuarios: 0,
      } as any);

      const resultado = await service.atribuirPermissoes(1, assignDto);

      expect(mockPermissionModel.findAll).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({}) }
      });
      expect(mockProfilePermissionModel.bulkCreate).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultado.permissoes).toHaveLength(3);
    });

    it('deve lançar NotFoundException se permissões não existirem', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockPermissionModel.findAll.mockResolvedValue([{ id: 1 }]); // Apenas 1 de 3

      await expect(service.atribuirPermissoes(1, assignDto)).rejects.toThrow(NotFoundException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('buscarPerfisPorTipo', () => {
    it('deve retornar perfis do tipo especificado', async () => {
      mockProfileModel.findAll.mockResolvedValue([mockProfile]);
      mockUserModel.count.mockResolvedValue(2);

      const resultado = await service.buscarPerfisPorTipo(TipoPerfil.ADMINISTRADOR);

      expect(mockProfileModel.findAll).toHaveBeenCalledWith({
        where: { tipo: TipoPerfil.ADMINISTRADOR, ativo: true },
        include: expect.any(Array),
        order: [['nome', 'ASC']]
      });
      expect(resultado).toHaveLength(1);
    });
  });

  describe('ativarDesativarPerfil', () => {
    it('deve alterar status do perfil', async () => {
      mockProfileModel.findByPk.mockResolvedValue(mockProfile);
      mockProfile.update.mockResolvedValue({ ...mockProfile, ativo: false });

      jest.spyOn(service, 'buscarPerfilPorId').mockResolvedValue({
        ...mockProfile,
        ativo: false,
        totalUsuarios: 0,
      } as any);

      const resultado = await service.ativarDesativarPerfil(1, false);

      expect(mockProfile.update).toHaveBeenCalledWith({ ativo: false });
      expect(resultado.ativo).toBe(false);
    });
  });

  describe('Validações de nível de acesso', () => {
    it('deve validar níveis corretos para cada tipo de perfil', () => {
      // Testes para validação de níveis por tipo
      expect(() => {
        (service as any).validarNivelAcessoPorTipo(TipoPerfil.ADMINISTRADOR, 90);
      }).not.toThrow();

      expect(() => {
        (service as any).validarNivelAcessoPorTipo(TipoPerfil.ALUNO, 50);
      }).toThrow(BadRequestException);

      expect(() => {
        (service as any).validarNivelAcessoPorTipo(TipoPerfil.PROFESSOR, 40);
      }).not.toThrow();
    });

    it('deve retornar níveis padrão corretos', () => {
      expect((service as any).obterNivelAcessoPadrao(TipoPerfil.ADMINISTRADOR)).toBe(100);
      expect((service as any).obterNivelAcessoPadrao(TipoPerfil.ALUNO)).toBe(10);
      expect((service as any).obterNivelAcessoPadrao(TipoPerfil.PROFESSOR)).toBe(50);
    });
  });
}); 