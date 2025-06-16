import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(), 
    findOne: jest.fn(), 
    create: jest.fn(), 
    update: jest.fn(), 
    remove: jest.fn()
  };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({  
    controllers: [UsersController],
    providers: [
      { provide: UsersService, useValue: mockUsersService },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  controller = module.get<UsersController>(UsersController);
});

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should overwrite username to "aluno" when creating a user', async () => {
    const createUserDto = {
      firstName: 'foo',
      lastName: 'bar',
      email: 'foo@example.com',
      username: 'should be overwritten',
      password: '12345',
    };
    mockUsersService.create.mockResolvedValue({ id: 1, ...createUserDto, username: 'aluno' });

    await controller.create(createUserDto);
    expect(mockUsersService.create).toHaveBeenCalledWith({ 
      ...createUserDto, 
      username: 'aluno'
    });
  });
});
