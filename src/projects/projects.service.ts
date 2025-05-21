import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
  ){}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectModel.create(createProjectDto);
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.findAll();
  }

  async findOne(id: number): Promise<Project | null> {
    return this.projectModel.findByPk();
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project | null> {
    const project = await this.findOne(id);
    if (!project) return null;

    await project.update(updateProjectDto);
    return project;
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id);
    if (project) {
      await project.destroy();
    }
  }
}
