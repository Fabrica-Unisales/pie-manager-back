// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { UserModel } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserModel),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const users = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
      },
    ];
    mockUserModel.findAll.mockResolvedValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
    expect(mockUserModel.findAll).toHaveBeenCalled();
  });

  it('should return a user by ID', async () => {
    const user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
    };
    mockUserModel.findByPk.mockResolvedValue(user);

    const result = await service.findOne(1);
    expect(result).toEqual(user);
    expect(mockUserModel.findByPk).toHaveBeenCalledWith(1, {
      attributes: { exclude: ['password'] },
    });
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'securepass',
    };

    const hashedPassword = '$2b$10$HashedMockedPassword1234567890';
    const createdUser = { id: 2, ...dto, password: hashedPassword };

    mockUserModel.create.mockResolvedValue(createdUser);

    const result = await service.create(dto);
    expect(result).toEqual(createdUser);
    expect(mockUserModel.create).toHaveBeenCalledWith(expect.objectContaining({
      ...dto,
      password: expect.any(String),
    }));
  });

  it('should remove a user', async () => {
    const mockUser = { id: 1 };
    mockUserModel.findByPk.mockResolvedValue(mockUser);
    mockUserModel.destroy.mockResolvedValue(1);

    const result = await service.remove(1);
    expect(result).toEqual({ success: true });
    expect(mockUserModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw NotFoundException when trying to remove a non-existent user', async () => {
    mockUserModel.findByPk.mockResolvedValue(null);
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a user', async () => {
    const existingUser = {
      id: 1,
      update: jest.fn().mockResolvedValue({ id: 1, firstName: 'Updated' }),
    };
    const updateDto: UpdateUserDto = { firstName: 'Updated' };

    mockUserModel.findByPk.mockResolvedValue(existingUser);

    const result = await service.update(1, updateDto);
    expect(existingUser.update).toHaveBeenCalledWith(expect.objectContaining(updateDto));
    expect(result).toEqual({ id: 1, firstName: 'Updated' });
  });

  it('should throw NotFoundException if user to update does not exist', async () => {
    mockUserModel.findByPk.mockResolvedValue(null);
    await expect(service.update(999, { firstName: 'Test' })).rejects.toThrow(NotFoundException);
  });

  it('should find user by username', async () => {
    const user = { id: 1, username: 'johndoe' };
    mockUserModel.findOne.mockResolvedValue(user);

    const result = await service.findByUsername('johndoe');
    expect(result).toEqual(user);
    expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { username: 'johndoe' } });
  });

  it('should return user with roles and permissions', async () => {
    const userWithGroups = {
      id: 1,
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'maria@example.com',
      username: 'maria',
      toJSON: function () { return this; },
      userGroups: [
        {
          group: {
            id: 1,
            tema: 'Admin',
            descricao: 'Grupo de administradores',
          },
        },
      ],
    };

    mockUserModel.findByPk.mockResolvedValue(userWithGroups);

    const result = await service.findOneWithRolesAndPermissions(1);
    expect(result).not.toBeNull();
    expect(result!.roles).toContain('Admin');
    expect(result!.permissions).toEqual([]);
    expect(result!.username).toEqual('maria');
  });

  it('should return null if user not found in findOneWithRolesAndPermissions', async () => {
    mockUserModel.findByPk.mockResolvedValue(null);

    const result = await service.findOneWithRolesAndPermissions(999);
    expect(result).toBeNull();
  });
});
