import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config/database.config';
import { ProfileModule } from './profile/profile.module';
import { PermissionModule } from './permission/permission.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ModuleModule } from './module/module.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TurmaModule } from './turma/turma.module';
import { GroupsModule } from './groups/groups.module';
import { CursosModule } from './cursos/cursos.module';


@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProfileModule,
    PermissionModule,
    GroupsModule,
    ModuleModule,
    ProjectsModule,
    TurmaModule,
    CursosModule,
    SequelizeModule.forRoot(databaseConfig),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
