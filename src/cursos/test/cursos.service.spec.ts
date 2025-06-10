import { Test, TestingModule } from '@nestjs/testing';
import { CursosService } from '../cursos.service';
import { getModelToken } from '@nestjs/sequelize';
import { Curso } from '../entities/curso.entity';

describe('CursosService', () => {
  let service: CursosService;
  let cursoModelMock: any;

  beforeEach(async () => {
    cursoModelMock = {
      create: jest.fn().mockResolvedValue({
        id: 1,
        nome: 'Engenharia',
        descricao: 'Curso de engenharia',
        criadoPorId: 1,
      }),
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        {
          provide: getModelToken(Curso),
          useValue: cursoModelMock,
        },
      ],
    }).compile();

    service = module.get<CursosService>(CursosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a course with the user ID', async () => {
    const dto = { nome: 'Engenharia', descricao: 'Curso de engenharia' };
    const userId = 1;

    const result = await service.create(dto, userId);

    expect(cursoModelMock.create).toHaveBeenCalledWith({
      ...dto,
      criadoPorId: userId,
    });
    expect(result.nome).toBe('Engenharia');

    // 👇 Para print no PR
    console.log('✅ Teste de criação de curso passou com sucesso');
  });
});
