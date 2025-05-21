import { Injectable } from '@nestjs/common';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { Turma } from './entities/turma.entity';

@Injectable()
export class TurmaService {
  private turmas: Turma[] = [];
  private id = 1;

  create(createTurmaDto: CreateTurmaDto): Turma {
    const novaTurma: Turma = {
      id: this.id++,
      ...createTurmaDto,
    };
    this.turmas.push(novaTurma);
    return novaTurma;
  }

  findAll(): Turma[] {
    return this.turmas;
  }

  findOne(id: number): Turma | undefined {
  return this.turmas.find(turma => turma.id === id);
}

  update(id: number, updateTurmaDto: UpdateTurmaDto): Turma {
  const turma = this.findOne(id);
  if (!turma) {
    throw new Error(`Turma com ID ${id} não encontrada.`);
  }
  Object.assign(turma, updateTurmaDto);
  return turma;
}


  remove(id: number): { message: string } {
    const index = this.turmas.findIndex(turma => turma.id === id);
    if (index !== -1) {
      this.turmas.splice(index, 1);
      return { message: `Turma com ID ${id} removida.` };
    }
    return { message: `Turma com ID ${id} não encontrada.` };
  }
}
