import { Test, TestingModule } from '@nestjs/testing';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

describe('ModuleController', () => {
  let controller: ModuleController;
  let service: ModuleService;

  const mockModule = {
    id: 1,
    name: 'Módulo 1',
    codigo: 'MOD001',
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockModule),
    findAll: jest.fn().mockResolvedValue([mockModule]),
    findOne: jest.fn().mockResolvedValue(mockModule),
    update: jest.fn().mockResolvedValue({ ...mockModule, name: 'Módulo Atualizado' }),
    remove: jest.fn().mockResolvedValue({ message: 'Módulo removido com sucesso' }),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ModuleController],
      providers: [
        {
          provide: ModuleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = moduleRef.get<ModuleController>(ModuleController);
    service = moduleRef.get<ModuleService>(ModuleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a module', async () => {
    const dto: CreateModuleDto = { name: 'Módulo 1', codigo: 'MOD001' };
    const result = await controller.create(dto);
    expect(result).toEqual(mockModule);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all modules', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockModule]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one module by id', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(mockModule);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a module', async () => {
    const updateDto: UpdateModuleDto = { name: 'Módulo Atualizado' };
    const result = await controller.update('1', updateDto);
    expect(result).toEqual({ ...mockModule, name: 'Módulo Atualizado' });
    expect(service.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('should remove a module', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual({ message: 'Módulo removido com sucesso' });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
