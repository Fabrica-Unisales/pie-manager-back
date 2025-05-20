import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserGroup } from '../groups/entities/user-group.entity';
import { UserModel } from './user.model';
@Module({
  imports: [SequelizeModule.forFeature([UserModel, UserGroup])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
