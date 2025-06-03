import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './entities/group.entity';
import { UserGroup } from './entities/user-group.entity';
import { Turma } from '../turma/entities/turma.entity';
import { User } from '../users/entities/user.entity';
import { TurmaModule } from 'src/turma/turma.module';
import { UserTurma } from 'src/turma/entities/user-turma.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Group, UserGroup, Turma, User, UserTurma]),
    TurmaModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [SequelizeModule],
})
export class GroupsModule {}