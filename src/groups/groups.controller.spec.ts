import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

describe('GroupsController', () => {
  let controller: GroupsController;
  let service: GroupsService;

  const mockGroupsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
    service = module.get<GroupsService>(GroupsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the created group', async () => {
      const dto: CreateGroupDto = {
        tema: 'Grupo de TCC',
        descricao: 'Estudo sobre IA',
        alunoIds: [1, 2],
      };

      const result = { id: 1, ...dto };
      mockGroupsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockGroupsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of groups', async () => {
      const groups = [{ id: 1, tema: 'IA', descricao: 'Grupo A' }];
      mockGroupsService.findAll.mockResolvedValue(groups);

      expect(await controller.findAll()).toEqual(groups);
    });
  });

  describe('findOne', () => {
    it('should return a group by ID', async () => {
      const group = { id: 1, tema: 'IA', descricao: 'Grupo A' };
      mockGroupsService.findOne.mockResolvedValue(group);

      expect(await controller.findOne('1')).toEqual(group);
      expect(mockGroupsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update and return the updated group', async () => {
      const dto: UpdateGroupDto = {
        tema: 'Atualizado',
        descricao: 'Nova descrição',
        alunoIds: [3],
      };
      const updatedGroup = { id: 1, ...dto };
      mockGroupsService.update.mockResolvedValue(updatedGroup);

      expect(await controller.update('1', dto)).toEqual(updatedGroup);
      expect(mockGroupsService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call remove with the correct ID', async () => {
      mockGroupsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(mockGroupsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
