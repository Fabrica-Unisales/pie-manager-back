import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getModelToken } from '@nestjs/sequelize';
import { Group } from './entities/group.entity';
import { UserGroup } from './entities/user-group.entity';
import { UserTurma } from '../turma/entities/user-turma.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('GroupsService', () => {
  let service: GroupsService;
  
  // Mock de todos os modelos necessários
  const mockGroupModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  
  const mockUserGroupModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
  };
  
  const mockUserTurmaModel = {
    findOne: jest.fn(),
  };
  
  const mockUser = {
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getModelToken(Group),
          useValue: mockGroupModel,
        },
        {
          provide: getModelToken(UserGroup),
          useValue: mockUserGroupModel,
        },
        {
          provide: getModelToken(UserTurma),
          useValue: mockUserTurmaModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUser,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  describe('create', () => {
    it('should successfully create a group with alunos', async () => {
      const dto = {
        turmaId: 1,
        alunoIds: [1, 2],
        tema: 'IA na Educação',
        descricao: 'Descrição teste',
        isActive: true,
      };

      const createdGroup = { id: 1, ...dto };
      mockGroupModel.create.mockResolvedValue(createdGroup);
      mockUserGroupModel.bulkCreate.mockResolvedValue([{}, {}]);

      const result = await service.create(dto);
      
      expect(result).toEqual(createdGroup);
      expect(mockGroupModel.create).toHaveBeenCalledWith({
        turmaId: dto.turmaId,
        tema: dto.tema,
        descricao: dto.descricao,
        isActive: dto.isActive,
      });
      expect(mockUserGroupModel.bulkCreate).toHaveBeenCalledWith([
        { userId: 1, groupId: 1 },
        { userId: 2, groupId: 1 },
      ]);
    });

    it('should set isActive to true by default', async () => {
      const dto = {
        turmaId: 1,
        alunoIds: [1],
        tema: 'IA',
      };

      mockGroupModel.create.mockResolvedValue({ id: 1, ...dto, isActive: true });
      mockUserGroupModel.bulkCreate.mockResolvedValue([{}]);

      await service.create(dto);
      
      expect(mockGroupModel.create).toHaveBeenCalledWith(expect.objectContaining({
        isActive: true,
      }));
    });
  });

  describe('findAll', () => {
    it('should return an array of groups with turma and users', async () => {
      const expectedGroups = [
        { id: 1, tema: 'IA', turma: {}, users: [] },
        { id: 2, tema: 'Blockchain', turma: {}, users: [] },
      ];
      
      mockGroupModel.findAll.mockResolvedValue(expectedGroups);

      const result = await service.findAll();
      
      expect(result).toEqual(expectedGroups);
      expect(mockGroupModel.findAll).toHaveBeenCalledWith({
        include: [
          { model: expect.anything() }, // Turma
          { model: expect.anything() }, // User
        ],
      });
    });

    it('should return empty array if no groups found', async () => {
      mockGroupModel.findAll.mockResolvedValue([]);
      
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single group with users', async () => {
      const expectedGroup = { id: 1, tema: 'IA', users: [] };
      mockGroupModel.findByPk.mockResolvedValue(expectedGroup);

      const result = await service.findOne(1);
      
      expect(result).toEqual(expectedGroup);
      expect(mockGroupModel.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: expect.anything() }], // User
      });
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupModel.findByPk.mockResolvedValue(null);
      
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update group and its alunos', async () => {
      const group = { id: 1, update: jest.fn().mockResolvedValue(true) };
      const updateDto = {
        tema: 'IA Atualizado',
        alunoIds: [3, 4],
      };

      mockGroupModel.findByPk.mockResolvedValue(group);
      mockUserGroupModel.destroy.mockResolvedValue(1);
      mockUserGroupModel.bulkCreate.mockResolvedValue([{}, {}]);

      const result = await service.update(1, updateDto);
      
      expect(group.update).toHaveBeenCalledWith(updateDto);
      expect(mockUserGroupModel.destroy).toHaveBeenCalledWith({
        where: { groupId: 1 },
      });
      expect(mockUserGroupModel.bulkCreate).toHaveBeenCalledWith([
        { userId: 3, groupId: 1 },
        { userId: 4, groupId: 1 },
      ]);
    });

    it('should update without changing alunos if alunoIds not provided', async () => {
      const group = { id: 1, update: jest.fn().mockResolvedValue(true) };
      const updateDto = { tema: 'IA Atualizado' };

      mockGroupModel.findByPk.mockResolvedValue(group);

      await service.update(1, updateDto);
      
      expect(group.update).toHaveBeenCalledWith(updateDto);
      expect(mockUserGroupModel.destroy).not.toHaveBeenCalled();
      expect(mockUserGroupModel.bulkCreate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupModel.findByPk.mockResolvedValue(null);
      
      await expect(service.update(999, {}))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a group', async () => {
      const group = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      mockGroupModel.findByPk.mockResolvedValue(group);

      await service.remove(1);
      
      expect(group.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupModel.findByPk.mockResolvedValue(null);
      
      await expect(service.remove(999))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('addAluno', () => {
    it('should add aluno to group with validation', async () => {
      const group = { id: 1, turmaId: 1 };
      const user = { id: 2 };
      
      mockGroupModel.findByPk.mockResolvedValue(group);
      mockUser.findByPk.mockResolvedValue(user);
      mockUserGroupModel.findOne.mockResolvedValue(null);
      mockUserTurmaModel.findOne.mockResolvedValue({});

      await service.addAluno(1, 2);
      
      expect(mockUserGroupModel.create).toHaveBeenCalledWith({
        groupId: 1,
        userId: 2,
      });
    });
  });

  describe('removeAluno', () => {
    it('should remove aluno from group with validation', async () => {
      const group = { id: 1 };
      const userInGroup = {
        destroy: jest.fn().mockResolvedValue(true),
      };
      
      mockGroupModel.findByPk.mockResolvedValue(group);
      mockUserGroupModel.findOne.mockResolvedValue(userInGroup);

      const result = await service.removeAluno(1, 2);
      
      expect(result).toEqual({
        message: 'Aluno 2 removido do grupo 1 com sucesso',
      });
      expect(userInGroup.destroy).toHaveBeenCalled();
    });
  });

  describe('verifyAlunoInTurma', () => {
    it('should return true if aluno is in turma', async () => {
      mockUserTurmaModel.findOne.mockResolvedValue({});
      
      const result = await service['verifyAlunoInTurma'](1, 1);
      expect(result).toBe(true);
    });

    it('should return false if aluno is not in turma', async () => {
      mockUserTurmaModel.findOne.mockResolvedValue(null);
      
      const result = await service['verifyAlunoInTurma'](1, 1);
      expect(result).toBe(false);
    });
  });
});