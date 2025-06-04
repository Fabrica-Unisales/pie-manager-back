import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  async findAll(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Group> {
    const group = await this.groupsService.findOne(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.groupsService.remove(id);
  }
}
