import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { ModuleModel } from './module.model';

@Module({
  imports: [
    SequelizeModule.forFeature([ModuleModel])
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService, SequelizeModule]
})
export class ModuleModule {}
