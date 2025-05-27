import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class TurmaService {
  constructor(
    @InjectModel(Turma)
    private turmaModel: typeof Turma,
  ) {}

  async create(createTurmaDto: CreateTurmaDto): Promise<Turma> {
    return this.turmaModel.create(createTurmaDto as CreationAttributes<Turma>);
  }

  async findAll(): Promise<Turma[]> {
    return this.turmaModel.findAll();
  }

  async findOne(id: number): Promise<Turma> {
    const turma = await this.turmaModel.findByPk(id);
    if (!turma) {
      throw new NotFoundException(`Turma com ID ${id} não encontrada.`);
    }
    return turma;
  }

  async update(id: number, updateTurmaDto: UpdateTurmaDto): Promise<Turma> {
    const turma = await this.findOne(id);
    return turma.update(updateTurmaDto);
  }

  async remove(id: number): Promise<{ message: string }> {
    const turma = await this.findOne(id);
    await turma.destroy();
    return { message: `Turma com ID ${id} removida.` };
  }
}
