import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import { Group } from 'src/groups/entities/group.entity';
import { AlocacaoController } from './alocacao-projects.controller';

@Module({
  imports: [SequelizeModule.forFeature([Project, User, Group])],
  controllers: [ProjectsController, AlocacaoController],
  providers: [ProjectsService, AlocacaoController],
})
export class ProjectsModule { }
