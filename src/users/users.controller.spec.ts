import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of users', async () => {
    const users = [{ id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }];
    mockUsersService.findAll.mockResolvedValue(users);

    const result = await controller.findAll();
    expect(result).toEqual(users);
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  it('should return a user by id', async () => {
    const user = { id: 1, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' };
    mockUsersService.findOne.mockResolvedValue(user);

    const result = await controller.findOne('1');
    expect(result).toEqual(user);
    expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      firstName: 'Charlie',
      lastName: 'Doe',
      email: 'charlie@example.com',
      username: 'charlied',
      password: '123456',
    };

    const createdUser = { id: 2, ...dto };
    mockUsersService.create.mockResolvedValue(createdUser);

    const result = await controller.create(dto);
    expect(result).toEqual(createdUser);
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = {
      firstName: 'Dave',
      lastName: 'Updated',
      email: 'dave.updated@example.com',
      username: 'daveupdated',
      password: 'newpassword',
    };

    const updatedUser = { id: 3, ...dto };
    mockUsersService.update.mockResolvedValue(updatedUser);

    const result = await controller.update('3', dto);
    expect(result).toEqual(updatedUser);
    expect(mockUsersService.update).toHaveBeenCalledWith(3, dto);
  });

  it('should delete a user', async () => {
    mockUsersService.remove.mockResolvedValue(1);

    const result = await controller.remove('1');
    expect(result).toEqual(1);
    expect(mockUsersService.remove).toHaveBeenCalledWith(1);
  });
});
