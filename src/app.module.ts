import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';
import { ProfileModule } from './profile/profile.module';
import { PermissionModule } from './permission/permission.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ModuleModule } from './module/module.module';
<<<<<<< HEAD
import { AuthModule } from './auth/auth.module';
=======
import { GroupsModule } from './groups/groups.module';
import { TurmaModule } from './turma/turma.module';
>>>>>>> 9c48d520b5802ae2b954b83ebbd74bf3589d0340

@Module({
  imports: [
    SequelizeModule.forRoot(databaseConfig),
    UsersModule,
    ProfileModule,
    PermissionModule,
    GroupsModule,
    TurmaModule,
    ModuleModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
