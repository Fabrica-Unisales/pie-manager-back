import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { UserModel } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
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
    const users = [{
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
    }];
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

    // Simula a senha já criptografada como o serviço faria
    const hashedPassword = '$2b$10$HeQCAMt/ByunXFbkSwExPu5wpRyso7cYexjAYATwIbNFdVr57eTWe';
    const createdUser = { id: 2, ...dto, password: hashedPassword };

    mockUserModel.create.mockResolvedValue(createdUser);

    const result = await service.create(dto);
    expect(result).toEqual(createdUser);
    expect(mockUserModel.create).toHaveBeenCalledWith(expect.objectContaining({
      ...dto,
      password: expect.any(String), // Aceita qualquer hash
    }));
  });

  it('should remove a user', async () => {
    mockUserModel.destroy.mockResolvedValue(1); // Simula remoção com sucesso

    const result = await service.remove(1);
    expect(result).toEqual(1);
    expect(mockUserModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
