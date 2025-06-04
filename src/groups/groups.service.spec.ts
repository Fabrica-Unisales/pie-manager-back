import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getModelToken } from '@nestjs/sequelize';
import { Group } from '../groups/entities/group.entity';
import { UserGroup } from './entities/user-group.entity';
import { NotFoundException } from '@nestjs/common';

describe('GroupsService', () => {
  let service: GroupsService;

  const mockGroupInstance = {
    id: 1,
    tema: 'IA na Educação',
    descricao: 'Grupo de IA',
    update: jest.fn(),
    reload: jest.fn().mockResolvedValue({
      id: 1,
      tema: 'IA na Educação Atualizado',
      descricao: 'Nova descrição',
    }),
    destroy: jest.fn(),
  };

  const mockGroupModel = {
    create: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        id: 1,
        ...dto,
        toJSON: () => ({ id: 1, ...dto }),
      }),
    ),
    findAll: jest.fn().mockResolvedValue([mockGroupInstance]),
    findByPk: jest.fn().mockImplementation((id) => {
      if (id === 1) return Promise.resolve(mockGroupInstance);
      return Promise.resolve(null);
    }),
  };

  const mockUserGroupModel = {
    bulkCreate: jest.fn().mockResolvedValue([]),
    findAll: jest.fn().mockResolvedValue([]),
    destroy: jest.fn().mockResolvedValue(1),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a group and associate users', async () => {
    const dto = {
      tema: 'IA na Educação',
      descricao: 'Grupo de estudo sobre IA aplicada à educação',
      alunoIds: [1, 2],
    };

    const result = await service.create(dto);

    expect(mockGroupModel.create).toHaveBeenCalledWith({
      tema: dto.tema,
      descricao: dto.descricao,
    });

    expect(mockUserGroupModel.bulkCreate).toHaveBeenCalledWith([
      { userId: 1, groupId: 1 },
      { userId: 2, groupId: 1 },
    ]);

    expect(result).toEqual({
      id: 1,
      tema: dto.tema,
      descricao: dto.descricao,
      alunoIds: dto.alunoIds,
    });
  });

  it('should throw an error if alunoIds is empty', async () => {
    const dto = {
      tema: 'Grupo Sem Alunos',
      descricao: 'Sem usuários associados',
      alunoIds: [],
    };

    await expect(service.create(dto)).rejects.toThrow('alunoIds cannot be empty');
  });

  it('should return all groups', async () => {
    const result = await service.findAll();
    expect(mockGroupModel.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockGroupInstance]);
  });

  it('should return a group by id', async () => {
    const result = await service.findOne(1);
    expect(mockGroupModel.findByPk).toHaveBeenCalledWith(1, { include: [expect.anything()] });
    expect(result).toEqual(mockGroupInstance);
  });

  it('should throw NotFoundException when group not found', async () => {
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should update a group and replace user associations', async () => {
    const dto = {
      tema: 'IA na Educação Atualizado',
      descricao: 'Nova descrição',
      alunoIds: [3, 4],
    };

    const result = await service.update(1, dto);

    expect(mockGroupInstance.update).toHaveBeenCalledWith(dto);
    expect(mockUserGroupModel.destroy).toHaveBeenCalledWith({ where: { groupId: 1 } });
    expect(mockUserGroupModel.bulkCreate).toHaveBeenCalledWith([
      { userId: 3, groupId: 1 },
      { userId: 4, groupId: 1 },
    ]);

    expect(result).toEqual({
      id: 1,
      tema: 'IA na Educação Atualizado',
      descricao: 'Nova descrição',
    });
  });

  it('should delete a group', async () => {
    const result = await service.remove(1);
    expect(mockGroupInstance.destroy).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
