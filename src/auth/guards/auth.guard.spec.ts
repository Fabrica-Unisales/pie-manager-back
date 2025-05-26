import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;

  const mockExecutionContext = (headers: any = {}): ExecutionContext => {
    const request = {
      headers,
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    roles: ['user'],
    permissions: ['users.read'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneWithRolesAndPermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get(Reflector);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  describe('Rotas Públicas', () => {
    it('deve permitir acesso a rotas marcadas como @Public()', async () => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return undefined;
      });

      const context = mockExecutionContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });

  describe('Autenticação JWT', () => {
    it('deve rejeitar requisições sem token', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token de acesso não fornecido')
      );
    });

    it('deve rejeitar tokens inválidos', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      
      const context = mockExecutionContext({
        authorization: 'Bearer invalid-token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token inválido')
      );
    });

    it('deve rejeitar quando usuário não é encontrado', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
      usersService.findOneWithRolesAndPermissions.mockResolvedValue(null);
      
      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Usuário não encontrado')
      );
    });

    it('deve permitir acesso com token válido e usuário existente', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
      usersService.findOneWithRolesAndPermissions.mockResolvedValue(mockUser);
      
      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(context.switchToHttp().getRequest().user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        roles: mockUser.roles,
        permissions: mockUser.permissions,
      });
    });
  });

  describe('Controle de Papéis (@Roles)', () => {
    beforeEach(() => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
      usersService.findOneWithRolesAndPermissions.mockResolvedValue(mockUser);
    });

    it('deve permitir acesso quando usuário tem papel necessário', async () => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['user', 'admin'];
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve rejeitar quando usuário não tem papel necessário', async () => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['admin', 'manager'];
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Acesso negado: papel insuficiente')
      );
    });

    it('deve permitir acesso quando não há papéis definidos', async () => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return undefined;
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Controle de Permissões (@Permissions)', () => {
    beforeEach(() => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
    });

    it('deve permitir acesso quando usuário tem todas as permissões necessárias', async () => {
      const userWithPermissions = {
        ...mockUser,
        permissions: ['users.read', 'users.write'],
      };
      usersService.findOneWithRolesAndPermissions.mockResolvedValue(userWithPermissions);

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['users.read', 'users.write'];
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve rejeitar quando usuário não tem todas as permissões necessárias', async () => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['users.read', 'users.delete'];
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Acesso negado: permissão insuficiente')
      );
    });

    it('deve permitir acesso quando não há permissões definidas', async () => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return undefined;
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Combinação de Papéis e Permissões', () => {
    it('deve permitir acesso quando usuário tem papel E permissões necessárias', async () => {
      const userWithRoleAndPermissions = {
        ...mockUser,
        roles: ['admin'],
        permissions: ['system.manage'],
      };
      usersService.findOneWithRolesAndPermissions.mockResolvedValue(userWithRoleAndPermissions);
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['admin'];
        if (key === PERMISSIONS_KEY) return ['system.manage'];
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve rejeitar quando usuário tem papel mas não tem permissão', async () => {
      const userWithRoleButNoPermission = {
        ...mockUser,
        roles: ['admin'],
        permissions: ['users.read'],
      };
      usersService.findOneWithRolesAndPermissions.mockResolvedValue(userWithRoleButNoPermission);
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === ROLES_KEY) return ['admin'];
        if (key === PERMISSIONS_KEY) return ['system.manage'];
        return undefined;
      });

      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Acesso negado: permissão insuficiente')
      );
    });
  });

  describe('Extração de Token', () => {
    it('deve extrair token do header Authorization Bearer', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
      usersService.findOneWithRolesAndPermissions.mockResolvedValue(mockUser);

      const context = mockExecutionContext({
        authorization: 'Bearer test-token-123',
      });

      await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('test-token-123');
    });

    it('deve rejeitar quando header não é Bearer', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const context = mockExecutionContext({
        authorization: 'Basic dGVzdA==',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token de acesso não fornecido')
      );
    });

    it('deve rejeitar quando não há header Authorization', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const context = mockExecutionContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token de acesso não fornecido')
      );
    });
  });
}); 