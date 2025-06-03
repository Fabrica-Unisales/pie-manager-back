import { Test, TestingModule } from '@nestjs/testing';
import { TurmaController } from './turma.controller';
import { TurmaService } from './turma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';

describe('TurmaController', () => {
  let controller: TurmaController;
  let service: TurmaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurmaController],
      providers: [
        {
          provide: TurmaService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1, nome: 'Turma X' }),
            findAll: jest.fn().mockResolvedValue([{ id: 1, nome: 'Turma X' }]),
            findOne: jest.fn().mockResolvedValue({ id: 1, nome: 'Turma X' }),
            update: jest.fn().mockResolvedValue({ id: 1, nome: 'Turma Atualizada' }),
            remove: jest.fn().mockResolvedValue({ message: 'Turma com ID 1 removida.' }),
          },
        },
      ],
    }).compile();

    controller = module.get<TurmaController>(TurmaController);
    service = module.get<TurmaService>(TurmaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve criar uma turma', async () => {
    const dto: CreateTurmaDto = {
      periodonome: 'Turma X',
      periodo: '2025.1',
      curso: 'Engenharia',
    };

    const result = await controller.create(dto);
    expect(result).toEqual({ id: 1, nome: 'Turma X' });
  });

  it('deve retornar todas as turmas', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, nome: 'Turma X' }]);
  });

  it('deve retornar uma turma por ID', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: 1, nome: 'Turma X' });
  });

  it('deve atualizar uma turma', async () => {
    const dto: UpdateTurmaDto = {
      periodonome: 'Turma Atualizada',
    };

    const result = await controller.update('1', dto);
    expect(result).toEqual({ id: 1, nome: 'Turma Atualizada' });
  });

  it('deve remover uma turma', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual({ message: 'Turma com ID 1 removida.' });
  });
});
