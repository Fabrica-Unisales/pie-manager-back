import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TurmaService } from './turma.service';
import { TurmaController } from './turma.controller';
import { Turma } from './entities/turma.entity';

@Module({
  imports: [SequelizeModule.forFeature([Turma])],
  controllers: [TurmaController],
  providers: [TurmaService],
})
export class TurmaModule {}
