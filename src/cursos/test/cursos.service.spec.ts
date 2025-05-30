import { Test, TestingModule } from '@nestjs/testing';
import { CursosService } from '../cursos.service';

describe('CursosService', () => {
  let service: CursosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursosService],
    }).compile();

    service = module.get<CursosService>(CursosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a course', () => {
    const curso = service.create({ nome: 'Engenharia', descricao: 'Curso de engenharia' });
    expect(curso).toHaveProperty('id');
    expect(curso.nome).toBe('Engenharia');
  });

  it('should return all courses', () => {
    service.create({ nome: 'Curso 1', descricao: 'Desc 1' });
    const cursos = service.findAll();
    expect(cursos.length).toBeGreaterThan(0);
  });

  it('should update a course', () => {
    const created = service.create({ nome: 'Old', descricao: 'Old desc' });
    const updated = service.update(created.id, { nome: 'New' });
    expect(updated.nome).toBe('New');
  });

  it('should delete a course', () => {
    const created = service.create({ nome: 'To delete', descricao: 'Del' });
    const removed = service.remove(created.id);
    expect(removed.nome).toBe('To delete');
  });
});
