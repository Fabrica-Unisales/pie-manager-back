import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UserGroup } from './entities/user-group.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group)
    private groupModel: typeof Group,

    @InjectModel(UserGroup)
    private userGroupModel: typeof UserGroup,
  ) {}

async create(createGroupDto: CreateGroupDto): Promise<Group> {
  const group = await this.groupModel.create({
    turmaId: createGroupDto.turmaId,
    tema: createGroupDto.tema,
    descricao: createGroupDto.descricao,
    isActive: createGroupDto.isActive ?? true
  });

    await this.userGroupModel.bulkCreate(
      createGroupDto.alunoIds.map((userId) => ({
        userId,
        groupId: group.id,
      })),
    );
    return group;
  }

  async findAll(): Promise<Group[]> {
    return this.groupModel.findAll({ include: [User] });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupModel.findByPk(id, { include: [User] });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    await group.update(updateGroupDto);

    if (updateGroupDto.alunoIds) {
      await this.userGroupModel.destroy({ where: { groupId: id } });
      await this.userGroupModel.bulkCreate(
        updateGroupDto.alunoIds.map((userId) => ({ userId, groupId: id })),
      );
    }

    return group.reload();
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);
    await group.destroy();
  }
}
