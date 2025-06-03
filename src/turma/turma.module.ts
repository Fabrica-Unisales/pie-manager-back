import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TurmaService } from './turma.service';
import { TurmaController } from './turma.controller';
import { Turma } from './entities/turma.entity';
import { UserTurma } from './entities/user-turma.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([Turma, UserTurma, User])],
  controllers: [TurmaController],
  providers: [TurmaService],
})
export class TurmaModule {}
