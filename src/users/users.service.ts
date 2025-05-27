import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogMethodCall } from '../common/decorators/logger.decorator';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserGroup } from '../groups/entities/user-group.entity';
import { Group } from '../groups/entities/group.entity';
import { PermissionModel } from '../permission/permission.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  @LogMethodCall()
  findAll() {
    return this.userModel.findAll({
      attributes: { exclude: ['password'] },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneWithRolesAndPermissions(id: number): Promise<any> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserGroup,
          include: [
            {
              model: Group,
              attributes: ['id', 'tema', 'descricao'],
            },
          ],
        },
      ],
    });

    if (!user) {
      return null;
    }

    const roles = user.userGroups?.map(ug => ug.group?.tema) || [];
    const permissions = [];

    return {
      ...user.toJSON(),
      roles,
      permissions,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return user.update(updateUserDto);
  }

  async remove(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.userModel.destroy({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }
}
