import { Injectable } from '@nestjs/common';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { LogMethodCall } from 'src/common/decorators/logger.decorator';

@Injectable()
export class TurmaService {

  create(CreateTurmaDto: CreateTurmaDto) {
    return 'This action adds a new turma';
  }
@LogMethodCall()
  findAll() {
    return `This action returns all turmas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} turma`;
  }

  update(id: number, UpdateTurmaDto: UpdateTurmaDto) {
    return `This action updates a #${id} turma`;
  }

  remove(id: number) {
    return `This action removes a #${id} turma`;
  }
}
