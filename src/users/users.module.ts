import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './user.model';
<<<<<<< HEAD

=======
import { User } from './entities/user.entity';
import { UserGroup } from '../groups/entities/user-group.entity';
>>>>>>> 9c48d520b5802ae2b954b83ebbd74bf3589d0340
@Module({
  imports: [SequelizeModule.forFeature([User, UserGroup])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
