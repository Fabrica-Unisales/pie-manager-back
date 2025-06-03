import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { TurmaService } from './turma.service';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { User } from '../users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

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
        SequelizeModule.forFeature([Turma, User]),
      ],
      providers: [TurmaService],
    }).compile();

    service = module.get<TurmaService>(TurmaService);
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
    await Turma.destroy({ where: {} });
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma nova turma', async () => {
    const dto: CreateTurmaDto = {
      periodonome: 'Turma A',
      periodo: '2025.1',
      curso: 'Engenharia',
    };

    const turma = await service.create(dto);
    expect(turma).toHaveProperty('id');
    expect(turma.nome).toBe('Turma A');
  });

  it('deve listar todas as turmas', async () => {
    await service.create({ periodonome: 'Turma B', periodo: '2025.1', curso: 'ADS' });
    const turmas = await service.findAll();
    expect(turmas.length).toBeGreaterThan(0);
  });

  it('deve retornar uma turma pelo ID', async () => {
    const turmaCriada = await service.create({
      periodonome: 'Turma C',
      periodo: '2025.2',
      curso: 'Direito',
    });

    const turma = await service.findOne(turmaCriada.id);
    expect(turma.nome).toBe('Turma C');
  });

  it('deve atualizar uma turma', async () => {
    const turmaCriada = await service.create({
      periodonome: 'Turma D',
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
      periodonome: 'Turma E',
      periodo: '2025.2',
      curso: 'Arquitetura',
    });

    const resposta = await service.remove(turmaCriada.id);
    expect(resposta).toEqual({ message: `Turma com ID ${turmaCriada.id} removida.` });

    await expect(service.findOne(turmaCriada.id)).rejects.toThrow();
  });

  it('deve adicionar e remover alunos corretamente', async () => {
    const turma = await service.create({ periodonome: 'Turma X', periodo: '2025.2', curso: 'TI' });

    const aluno1 = await User.create({
      firstName: 'João',
      lastName: 'Silva',
      email: 'a1@email.com',
      username: 'a1',
      password: '123',
    });

    const aluno2 = await User.create({
      firstName: 'Maria',
      lastName: 'Souza',
      email: 'a2@email.com',
      username: 'a2',
      password: '123',
    });

    await service.updateAlunosNaTurma(turma.id, { add: [aluno1.id, aluno2.id] });
    let turmaAtualizada = await service.findOne(turma.id);
    expect(turmaAtualizada.alunos.length).toBe(2);

    await service.updateAlunosNaTurma(turma.id, { remove: [aluno1.id] });
    turmaAtualizada = await service.findOne(turma.id);
    expect(turmaAtualizada.alunos.length).toBe(1);
    expect(turmaAtualizada.alunos[0].id).toBe(aluno2.id);
  });

  it('deve garantir que um aluno só pertença a uma turma por vez', async () => {
    const turma1 = await service.create({ periodonome: 'Turma 1', periodo: '2025.2', curso: 'TI' });
    const turma2 = await service.create({ periodonome: 'Turma 2', periodo: '2025.2', curso: 'TI' });

    const aluno = await User.create({
      firstName: 'Carlos',
      lastName: 'Lima',
      email: 'a3@email.com',
      username: 'a3',
      password: '123',
    });

    await service.updateAlunosNaTurma(turma1.id, { add: [aluno.id] });

    await expect(
      service.updateAlunosNaTurma(turma2.id, { add: [aluno.id] })
    ).rejects.toThrow(BadRequestException);
  });
});
