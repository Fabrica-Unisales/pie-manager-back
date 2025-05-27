import { Module } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Curso } from './entities/curso.entity';

@Module({
  imports: [SequelizeModule.forFeature([Curso])],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}
