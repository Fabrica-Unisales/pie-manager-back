import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UserGroup } from './entities/user-group.entity';
import { User } from '../users/entities/user.entity';
import { Turma } from '../turma/entities/turma.entity';
import { UserTurma } from '../turma/entities/user-turma.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group)
    private groupModel: typeof Group,

    @InjectModel(UserGroup)
    private userGroupModel: typeof UserGroup,

    @InjectModel(UserTurma)
    private userTurmaModel: typeof UserTurma,
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
  return this.groupModel.findAll({ 
    include: [
      { model: Turma },
      { model: User }
    ]
  });
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

  private async verifyAlunoInTurma(userId: number, turmaId: number): Promise<boolean> {
    const relation = await this.userTurmaModel.findOne({
      where: { userId, turmaId }
    });
    return !!relation;
  }

  async addAluno(groupId: number, userId: number): Promise<void> {
    const group = await this.groupModel.findByPk(groupId, { include: [Turma] });
    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundException('Aluno não encontrado');
    }

    const existing = await this.userGroupModel.findOne({
      where: { groupId, userId }
    });
    if (existing) {
      throw new BadRequestException('Aluno já está no grupo');
    }

    // Verificação se aluno pertence à turma
    const alunoNaTurma = await this.verifyAlunoInTurma(userId, group.turmaId);
    if (!alunoNaTurma) {
      throw new BadRequestException('Aluno não pertence à turma deste grupo');
    }

    await this.userGroupModel.create({ groupId, userId });
  }

  async removeAluno(groupId: number, userId: number): Promise<{ message: string }> {
    // Verifica se o grupo existe
    const group = await this.groupModel.findByPk(groupId);
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    // Verifica se o aluno está no grupo
    const userInGroup = await this.userGroupModel.findOne({
      where: { groupId, userId }
    });

    if (!userInGroup) {
      throw new BadRequestException(
        `Aluno com ID ${userId} não está no grupo ${groupId}`
      );
    }

    // Remove a associação
    await userInGroup.destroy();

    return { 
      message: `Aluno ${userId} removido do grupo ${groupId} com sucesso` 
    };
  }
}
