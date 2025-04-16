import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [SequelizeModule.forRoot(databaseConfig), UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
