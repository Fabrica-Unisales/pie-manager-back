import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Turma } from './entities/turma.entity';
import { TurmaService } from './turma.service';
import { TurmaController } from './turma.controller';

@Module({
  imports: [SequelizeModule.forFeature([Turma])],
  controllers: [TurmaController],
  providers: [TurmaService],
  exports: [TurmaService],
})
export class TurmaModule {}