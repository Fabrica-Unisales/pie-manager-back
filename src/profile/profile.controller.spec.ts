import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { TipoPerfil } from './entities/profile.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockProfileResponse = {
    id: 1,
    nome: 'Administrador',
    descricao: 'Perfil administrativo',
    tipo: TipoPerfil.ADMINISTRADOR,
    ativo: true,
    nivelAcesso: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissoes: [],
    totalUsuarios: 0,
  };

  const mockProfileService = {
    criarPerfil: jest.fn(),
    buscarTodosPerfis: jest.fn(),
    buscarPerfilPorId: jest.fn(),
    atualizarPerfil: jest.fn(),
    removerPerfil: jest.fn(),
    atribuirPermissoes: jest.fn(),
    removerPermissoes: jest.fn(),
    buscarPerfisPorTipo: jest.fn(),
    ativarDesativarPerfil: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('criarPerfil', () => {
    const createDto: CreateProfileDto = {
      nome: 'Novo Perfil',
      descricao: 'Descrição do perfil',
      tipo: TipoPerfil.PROFESSOR,
      ativo: true,
      nivelAcesso: 50,
      permissaoIds: [1, 2],
    };

    it('deve criar um perfil com sucesso', async () => {
      mockProfileService.criarPerfil.mockResolvedValue(mockProfileResponse);

      const resultado = await controller.criarPerfil(createDto);

      expect(service.criarPerfil).toHaveBeenCalledWith(createDto);
      expect(resultado).toEqual(mockProfileResponse);
    });

    it('deve propagar ConflictException do service', async () => {
      mockProfileService.criarPerfil.mockRejectedValue(new ConflictException('Perfil já existe'));

      await expect(controller.criarPerfil(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('buscarTodosPerfis', () => {
    it('deve retornar lista de perfis ativos por padrão', async () => {
      mockProfileService.buscarTodosPerfis.mockResolvedValue([mockProfileResponse]);

      const resultado = await controller.buscarTodosPerfis();

      expect(service.buscarTodosPerfis).toHaveBeenCalledWith(false);
      expect(resultado).toEqual([mockProfileResponse]);
    });

    it('deve incluir perfis inativos quando solicitado', async () => {
      mockProfileService.buscarTodosPerfis.mockResolvedValue([mockProfileResponse]);

      await controller.buscarTodosPerfis(true);

      expect(service.buscarTodosPerfis).toHaveBeenCalledWith(true);
    });
  });

  describe('buscarPerfilPorId', () => {
    it('deve retornar perfil quando encontrado', async () => {
      mockProfileService.buscarPerfilPorId.mockResolvedValue(mockProfileResponse);

      const resultado = await controller.buscarPerfilPorId(1);

      expect(service.buscarPerfilPorId).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(mockProfileResponse);
    });

    it('deve propagar NotFoundException do service', async () => {
      mockProfileService.buscarPerfilPorId.mockRejectedValue(new NotFoundException('Perfil não encontrado'));

      await expect(controller.buscarPerfilPorId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizarPerfil', () => {
    const updateDto: UpdateProfileDto = {
      nome: 'Nome Atualizado',
      nivelAcesso: 60,
    };

    it('deve atualizar perfil com sucesso', async () => {
      const updatedProfile = { ...mockProfileResponse, ...updateDto };
      mockProfileService.atualizarPerfil.mockResolvedValue(updatedProfile);

      const resultado = await controller.atualizarPerfil(1, updateDto);

      expect(service.atualizarPerfil).toHaveBeenCalledWith(1, updateDto);
      expect(resultado).toEqual(updatedProfile);
    });

    it('deve propagar ConflictException do service', async () => {
      mockProfileService.atualizarPerfil.mockRejectedValue(new ConflictException('Nome já existe'));

      await expect(controller.atualizarPerfil(1, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('removerPerfil', () => {
    it('deve remover perfil com sucesso', async () => {
      mockProfileService.removerPerfil.mockResolvedValue(undefined);

      await controller.removerPerfil(1);

      expect(service.removerPerfil).toHaveBeenCalledWith(1);
    });

    it('deve propagar BadRequestException do service', async () => {
      mockProfileService.removerPerfil.mockRejectedValue(
        new BadRequestException('Perfil possui usuários associados')
      );

      await expect(controller.removerPerfil(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('atribuirPermissoes', () => {
    const assignDto: AssignPermissionsDto = {
      permissaoIds: [1, 2, 3],
      dataExpiracao: '2024-12-31T23:59:59.000Z',
    };

    it('deve atribuir permissões com sucesso', async () => {
      const profileWithPermissions = {
        ...mockProfileResponse,
        permissoes: [{ id: 1 }, { id: 2 }, { id: 3 }],
      };
      mockProfileService.atribuirPermissoes.mockResolvedValue(profileWithPermissions);

      const resultado = await controller.atribuirPermissoes(1, assignDto);

      expect(service.atribuirPermissoes).toHaveBeenCalledWith(1, assignDto);
      expect(resultado).toEqual(profileWithPermissions);
    });
  });

  describe('removerPermissoes', () => {
    it('deve remover permissões com sucesso', async () => {
      mockProfileService.removerPermissoes.mockResolvedValue(mockProfileResponse);

      const resultado = await controller.removerPermissoes(1, [1, 2]);

      expect(service.removerPermissoes).toHaveBeenCalledWith(1, [1, 2]);
      expect(resultado).toEqual(mockProfileResponse);
    });
  });

  describe('buscarPerfisPorTipo', () => {
    it('deve retornar perfis do tipo especificado', async () => {
      mockProfileService.buscarPerfisPorTipo.mockResolvedValue([mockProfileResponse]);

      const resultado = await controller.buscarPerfisPorTipo(TipoPerfil.ADMINISTRADOR);

      expect(service.buscarPerfisPorTipo).toHaveBeenCalledWith(TipoPerfil.ADMINISTRADOR);
      expect(resultado).toEqual([mockProfileResponse]);
    });
  });

  describe('alterarStatusPerfil', () => {
    it('deve alterar status do perfil', async () => {
      const inactiveProfile = { ...mockProfileResponse, ativo: false };
      mockProfileService.ativarDesativarPerfil.mockResolvedValue(inactiveProfile);

      const resultado = await controller.alterarStatusPerfil(1, false);

      expect(service.ativarDesativarPerfil).toHaveBeenCalledWith(1, false);
      expect(resultado).toEqual(inactiveProfile);
    });
  });
});
