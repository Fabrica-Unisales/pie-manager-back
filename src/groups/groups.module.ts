import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './entities/group.entity';
import { UserGroup } from './entities/user-group.entity';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([Group, UserGroup, User])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [SequelizeModule],
})
export class GroupsModule {}