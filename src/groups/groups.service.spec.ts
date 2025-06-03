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

  describe('addAluno', () => {
    it('should add aluno to group', async () => {
      mockGroupModel.findByPk.mockResolvedValue({ id: 1, turmaId: 1 });
      mockUserGroupModel.create.mockResolvedValue({ groupId: 1, userId: 1 });
      
      await service.addAluno(1, 1);
      
      expect(mockUserGroupModel.create).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1
      });
    });
  });

  describe('removeAluno', () => {
  it('should remove aluno from group', async () => {
    mockUserGroupModel.findOne.mockResolvedValue({
      destroy: jest.fn().mockResolvedValue(true)
    });

    const result = await service.removeAluno(1, 1);
    
    expect(result).toEqual({
      message: 'Aluno 1 removido do grupo 1 com sucesso'
    });
  });

  it('should throw if aluno not in group', async () => {
    mockUserGroupModel.findOne.mockResolvedValue(null);

    await expect(service.removeAluno(1, 999))
      .rejects
      .toThrow(BadRequestException);
  });
});