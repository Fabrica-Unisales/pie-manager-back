import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';
import { ProfileModule } from './profile/profile.module';
import { PermissionModule } from './permission/permission.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [SequelizeModule.forRoot(databaseConfig), UsersModule, ProfileModule, PermissionModule, MenuModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
