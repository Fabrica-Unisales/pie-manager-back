import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Profile } from './entities/profile.entity';
import { ProfilePermission } from './entities/profile-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Profile,
      ProfilePermission,
      Permission,
      User
    ])
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService, SequelizeModule]
})
export class ProfileModule {}
