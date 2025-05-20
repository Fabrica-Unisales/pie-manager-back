import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './user.model';
import { User } from './entities/user.entity';
import { UserGroup } from '../groups/entities/user-group.entity';
@Module({
  imports: [SequelizeModule.forFeature([User, UserGroup])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
