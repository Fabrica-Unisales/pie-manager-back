import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ModuleModel } from './module.model';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(ModuleModel)
    private readonly moduleModel: typeof ModuleModel,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<ModuleModel> {
    return await this.moduleModel.create(createModuleDto);
  }

  async findAll(): Promise<ModuleModel[]> {
    return await this.moduleModel.findAll();
  }

  async findOne(id: number): Promise<ModuleModel> {
    const module = await this.moduleModel.findByPk(id);
    if (!module) {
      throw new NotFoundException(`Module with id ${id} not found`);
    }
    return module;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<ModuleModel> {
    const module = await this.findOne(id); // Verifica se existe
    await module.update(updateModuleDto);
    return module;
  }

  async remove(id: number): Promise<void> {
    const module = await this.findOne(id); // Verifica se existe
    await module.destroy();
  }
}
