import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogMethodCall } from '../common/decorators/logger.decorator';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserGroup } from '../groups/entities/user-group.entity';
import { Group } from '../groups/entities/group.entity';
import * as bcrypt from 'bcrypt';

interface UserWithRolesAndPermissions {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.password?.trim()) {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  @LogMethodCall()
  async findAll(): Promise<User[]> {
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

  async findOneWithRolesAndPermissions(
    id: number,
  ): Promise<UserWithRolesAndPermissions | null> {
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

    const jsonUser = user.toJSON?.() || user;
    const roles = user.userGroups?.map((ug) => ug.group?.tema).filter(Boolean) || [];
    const permissions: string[] = []; // futuro: extrair permissões aqui se necessário

    return {
      id: jsonUser.id,
      firstName: jsonUser.firstName,
      lastName: jsonUser.lastName,
      email: jsonUser.email,
      username: jsonUser.username,
      roles,
      permissions,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password?.trim()) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete updateUserDto.password;
    }

    return user.update(updateUserDto);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userModel.destroy({ where: { id } });

    return { success: true };
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }
}
