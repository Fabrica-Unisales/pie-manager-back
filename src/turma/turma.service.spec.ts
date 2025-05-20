import { Test, TestingModule } from '@nestjs/testing';
import { TurmaService } from './turma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';

describe('TurmaService', () => {
  let service: TurmaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TurmaService],
    }).compile();

    service = module.get<TurmaService>(TurmaService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma nova turma', () => {
    const dto: CreateTurmaDto = {
      nome: 'Turma A',
      periodo: '2025.1',
      curso: 'Engenharia',
    };

    const turma = service.create(dto);
    expect(turma).toHaveProperty('id');
    expect(turma.nome).toBe('Turma A');
  });

  it('deve listar todas as turmas', () => {
    service.create({ nome: 'Turma B', periodo: '2025.1', curso: 'ADS' });
    const turmas = service.findAll();
    expect(turmas.length).toBeGreaterThan(0);
  });

  it('deve retornar uma turma pelo ID', () => {
    const turmaCriada = service.create({ nome: 'Turma C', periodo: '2025.2', curso: 'Direito' });
    const turma = service.findOne(turmaCriada.id);
    expect(turma).toEqual(turmaCriada);
  });

  it('deve atualizar uma turma', () => {
    const turmaCriada = service.create({ nome: 'Turma D', periodo: '2025.2', curso: 'Medicina' });
    const atualizada = service.update(turmaCriada.id, { nome: 'Turma D Atualizada' });
    expect(atualizada.nome).toBe('Turma D Atualizada');
  });

  it('deve remover uma turma', () => {
    const turmaCriada = service.create({ nome: 'Turma E', periodo: '2025.2', curso: 'Arquitetura' });
    const resposta = service.remove(turmaCriada.id);
    expect(resposta).toEqual({ message: `Turma com ID ${turmaCriada.id} removida.` });
    expect(service.findOne(turmaCriada.id)).toBeUndefined();
  });
});
