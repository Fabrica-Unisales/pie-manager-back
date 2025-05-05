import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';
import { ProfileModule } from './profile/profile.module';
import { PermissionModule } from './permission/permission.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    SequelizeModule.forRoot(databaseConfig),
    UsersModule,
    ProfileModule,
    PermissionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
