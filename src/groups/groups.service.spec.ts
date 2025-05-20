import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getModelToken } from '@nestjs/sequelize';
import { Group } from './entities/group.entity';

describe('GroupsService', () => {
  let service: GroupsService;
  const mockGroupModel = {
    create: jest.fn().mockImplementation(dto => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn().mockImplementation(() => Promise.resolve([])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getModelToken(Group),
          useValue: mockGroupModel,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should create a group', async () => {
    const dto = { turmaId: 1, alunoIds: [1, 2], tema: 'IA na Educação' };
    expect(await service.create(dto)).toEqual({
      id: 1,
      ...dto,
    });
    expect(mockGroupModel.create).toHaveBeenCalledWith(dto);
  });
});