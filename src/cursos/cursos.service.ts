import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Curso } from './entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursosService {
  constructor(
    @InjectModel(Curso)
    private cursoModel: typeof Curso,
  ) {}

 create(createCursoDto: CreateCursoDto) {
  return this.cursoModel.create({
    nome: createCursoDto.nome,
    descricao: createCursoDto.descricao,
  });
}

  findAll() {
    return this.cursoModel.findAll();
  }

  findOne(id: number) {
    return this.cursoModel.findByPk(id);
  }

  async update(id: number, updateCursoDto: UpdateCursoDto) {
    const curso = await this.cursoModel.findByPk(id);
    if (curso) {
      return curso.update(updateCursoDto);
    }
    return null;
  }

  async remove(id: number) {
    const curso = await this.cursoModel.findByPk(id);
    if (curso) {
      await curso.destroy();
      return curso;
    }
    return null;
  }
}
