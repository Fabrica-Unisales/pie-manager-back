import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('GroupsController', () => {
  let controller: GroupsController;
  const mockGroupsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addAluno: jest.fn(),
    removeAluno: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
  });

  describe('create', () => {
    it('should create a group', async () => {
      const dto: CreateGroupDto = {
        turmaId: 1,
        alunoIds: [1, 2],
        tema: 'IA na Educação',
        descricao: 'Projeto sobre IA',
        isActive: true,
      };

      const result = { id: 1, ...dto };
      mockGroupsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockGroupsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of groups', async () => {
      const result = [{ id: 1, tema: 'IA' }];
      mockGroupsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single group', async () => {
      const result = { id: 1, tema: 'IA' };
      mockGroupsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(mockGroupsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      const dto: UpdateGroupDto = { tema: 'IA Atualizado' };
      const result = { id: 1, ...dto };
      mockGroupsService.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
      expect(mockGroupsService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a group', async () => {
      mockGroupsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(mockGroupsService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('addAluno', () => {
    it('should add aluno to group', async () => {
      mockGroupsService.addAluno.mockResolvedValue(undefined);

      await controller.addAluno('1', '2');
      expect(mockGroupsService.addAluno).toHaveBeenCalledWith(1, 2);
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupsService.addAluno.mockRejectedValue(new NotFoundException());

      await expect(controller.addAluno('999', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if aluno already in group', async () => {
      mockGroupsService.addAluno.mockRejectedValue(new BadRequestException());

      await expect(controller.addAluno('1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeAluno', () => {
    it('should remove aluno from group', async () => {
      const successMessage = { message: 'Aluno 2 removido do grupo 1 com sucesso' };
      mockGroupsService.removeAluno.mockResolvedValue(successMessage);

      expect(await controller.removeAluno('1', '2')).toEqual(successMessage);
      expect(mockGroupsService.removeAluno).toHaveBeenCalledWith(1, 2);
    });

    it('should throw NotFoundException if group not found', async () => {
      mockGroupsService.removeAluno.mockRejectedValue(new NotFoundException());

      await expect(controller.removeAluno('999', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if aluno not in group', async () => {
      mockGroupsService.removeAluno.mockRejectedValue(new BadRequestException());

      await expect(controller.removeAluno('1', '999')).rejects.toThrow(BadRequestException);
    });
  });
});