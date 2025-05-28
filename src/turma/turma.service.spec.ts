import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { TurmaService } from './turma.service';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';

describe('TurmaService (integração)', () => {
  let service: TurmaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          synchronize: true,
        }),
        SequelizeModule.forFeature([Turma]),
      ],
      providers: [TurmaService],
    }).compile();

    service = module.get<TurmaService>(TurmaService);
  });

  afterEach(async () => {
    await Turma.destroy({ where: {} });
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma nova turma', async () => {
    const dto: CreateTurmaDto = {
      nome: 'Turma A',
      periodo: '2025.1',
      curso: 'Engenharia',
    };

    const turma = await service.create(dto);
    expect(turma).toHaveProperty('id');
    expect(turma.nome).toBe('Turma A');
  });

  it('deve listar todas as turmas', async () => {
    await service.create({ nome: 'Turma B', periodo: '2025.1', curso: 'ADS' });
    const turmas = await service.findAll();
    expect(turmas.length).toBeGreaterThan(0);
  });

  it('deve retornar uma turma pelo ID', async () => {
    const turmaCriada = await service.create({
      nome: 'Turma C',
      periodo: '2025.2',
      curso: 'Direito',
    });

    const turma = await service.findOne(turmaCriada.id);
    expect(turma.nome).toBe('Turma C');
  });

  it('deve atualizar uma turma', async () => {
    const turmaCriada = await service.create({
      nome: 'Turma D',
      periodo: '2025.2',
      curso: 'Medicina',
    });

    const atualizada = await service.update(turmaCriada.id, {
      nome: 'Turma D Atualizada',
    } as UpdateTurmaDto);

    expect(atualizada.nome).toBe('Turma D Atualizada');
  });

  it('deve remover uma turma', async () => {
    const turmaCriada = await service.create({
      nome: 'Turma E',
      periodo: '2025.2',
      curso: 'Arquitetura',
    });

    const resposta = await service.remove(turmaCriada.id);
    expect(resposta).toEqual({ message: `Turma com ID ${turmaCriada.id} removida.` });

    await expect(service.findOne(turmaCriada.id)).rejects.toThrow();
  });
});
