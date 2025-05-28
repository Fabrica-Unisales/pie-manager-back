import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ModuleService } from './module.service';
import { ModuleModel } from './module.model';
import { NotFoundException } from '@nestjs/common';

const mockModule = {
  idModule: 1,
  name: 'Test Module',
  description: 'A test module',
  codigo: 'TEST001',
  isActive: true,
  update: jest.fn(),
  destroy: jest.fn(),
};

const moduleModelMock = {
  create: jest.fn().mockResolvedValue(mockModule),
  findAll: jest.fn().mockResolvedValue([mockModule]),
  findByPk: jest.fn().mockResolvedValue(mockModule),
};

describe('ModuleService', () => {
  let service: ModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        {
          provide: getModelToken(ModuleModel),
          useValue: moduleModelMock,
        },
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a module', async () => {
    const dto = {
      name: 'Test Module',
      description: 'A test module',
      codigo: 'TEST001',
      isActive: true,
    };
    const result = await service.create(dto);
    expect(result).toEqual(mockModule);
    expect(moduleModelMock.create).toHaveBeenCalledWith(dto);
  });

  it('should return all modules', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockModule]);
    expect(moduleModelMock.findAll).toHaveBeenCalled();
  });

  it('should return a module by id', async () => {
    const result = await service.findOne(1);
    expect(result).toEqual(mockModule);
    expect(moduleModelMock.findByPk).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if module not found', async () => {
    moduleModelMock.findByPk.mockResolvedValueOnce(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should update a module', async () => {
    const dto = { name: 'Updated Module' };
    mockModule.update.mockResolvedValueOnce({ ...mockModule, ...dto });

    const result = await service.update(1, dto);
    expect(result).toEqual({ ...mockModule, ...dto });
    expect(mockModule.update).toHaveBeenCalledWith(dto);
  });

  it('should remove a module', async () => {
    await service.remove(1);
    expect(mockModule.destroy).toHaveBeenCalled();
  });
});
