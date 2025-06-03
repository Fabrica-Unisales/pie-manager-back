import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Turma } from './entities/turma.entity';
import { User } from '../users/entities/user.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class TurmaService {
  constructor(
    @InjectModel(Turma)
    private turmaModel: typeof Turma,

    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createTurmaDto: CreateTurmaDto): Promise<Turma> {
    return this.turmaModel.create({
      nome: createTurmaDto.periodonome,
      periodo: createTurmaDto.periodo,
      curso: createTurmaDto.curso,
    } as CreationAttributes<Turma>);
  }

  async findAll(): Promise<Turma[]> {
    return this.turmaModel.findAll({ include: [User] });
  }

  async findOne(id: number): Promise<Turma> {
    const turma = await this.turmaModel.findByPk(id, { include: [User] });
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

  async updateAlunosNaTurma(
    turmaId: number,
    { add = [], remove = [] }: { add?: number[]; remove?: number[] }
  ): Promise<Turma> {
    const turma = await this.findOne(turmaId);

    if (remove.length > 0) {
      await this.userModel.update({ turmaId: null }, { where: { id: remove, turmaId } });
    }

    if (add.length > 0) {
      const alunos = await this.userModel.findAll({ where: { id: add } });

      const alunosEmOutraTurma = alunos.filter(
        (aluno) => aluno.turmaId !== null && aluno.turmaId !== turmaId
      );

      if (alunosEmOutraTurma.length > 0) {
        const nomes = alunosEmOutraTurma.map((a) => `${a.firstName} ${a.lastName}`).join(', ');
        throw new BadRequestException(
          `Os seguintes alunos já estão em outra turma: ${nomes}. Remova-os primeiro.`
        );
      }

      await this.userModel.update({ turmaId }, { where: { id: add } });
    }

    return this.findOne(turmaId);
  }
}