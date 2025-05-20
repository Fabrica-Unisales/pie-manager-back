// src/groups/groups.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getModelToken } from '@nestjs/sequelize';
import { Group } from './entities/group.entity';
import { UserGroup } from './entities/user-group.entity';

describe('GroupsService', () => {
  let service: GroupsService;
  const mockGroupModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  const mockUserGroupModel = {
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
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
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  describe('create', () => {
    it('should create a group with alunos', async () => {
      const dto = { turmaId: 1, alunoIds: [1, 2], tema: 'IA' };
      mockGroupModel.create.mockResolvedValue({ id: 1, ...dto });
      
      const result = await service.create(dto);
      
      expect(result).toEqual({ id: 1, ...dto });
      expect(mockUserGroupModel.bulkCreate).toHaveBeenCalledWith([
        { userId: 1, groupId: 1 },
        { userId: 2, groupId: 1 },
      ]);
    });
  });

});