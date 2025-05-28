import { Controller, Get, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Roles, ROLES_KEY } from './roles.decorator';
import { Permissions, PERMISSIONS_KEY } from './permissions.decorator';
import { Public, IS_PUBLIC_KEY } from './public.decorator';
import { User } from './user.decorator';

describe('Decorators de Controle de Acesso', () => {
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [Reflector],
    }).compile();

    reflector = module.get<Reflector>(Reflector);
  });

  describe('@Roles Decorator', () => {
    @Controller('test')
    class TestController {
      @Get('admin-only')
      @Roles('admin')
      adminOnlyRoute() {
        return 'admin content';
      }

      @Get('multi-roles')
      @Roles('admin', 'manager', 'user')
      multiRolesRoute() {
        return 'multi roles content';
      }

      @Get('no-roles')
      noRolesRoute() {
        return 'no roles content';
      }
    }

    it('deve definir metadados para papel único', () => {
      const roles = reflector.get(ROLES_KEY, TestController.prototype.adminOnlyRoute);
      expect(roles).toEqual(['admin']);
    });

    it('deve definir metadados para múltiplos papéis', () => {
      const roles = reflector.get(ROLES_KEY, TestController.prototype.multiRolesRoute);
      expect(roles).toEqual(['admin', 'manager', 'user']);
    });

    it('deve retornar undefined quando não há decorator @Roles', () => {
      const roles = reflector.get(ROLES_KEY, TestController.prototype.noRolesRoute);
      expect(roles).toBeUndefined();
    });
  });

  describe('@Permissions Decorator', () => {
    @Controller('test')
    class TestController {
      @Get('read-only')
      @Permissions('users.read')
      readOnlyRoute() {
        return 'read content';
      }

      @Get('multi-permissions')
      @Permissions('users.read', 'users.write', 'users.delete')
      multiPermissionsRoute() {
        return 'multi permissions content';
      }

      @Get('no-permissions')
      noPermissionsRoute() {
        return 'no permissions content';
      }
    }

    it('deve definir metadados para permissão única', () => {
      const permissions = reflector.get(PERMISSIONS_KEY, TestController.prototype.readOnlyRoute);
      expect(permissions).toEqual(['users.read']);
    });

    it('deve definir metadados para múltiplas permissões', () => {
      const permissions = reflector.get(PERMISSIONS_KEY, TestController.prototype.multiPermissionsRoute);
      expect(permissions).toEqual(['users.read', 'users.write', 'users.delete']);
    });

    it('deve retornar undefined quando não há decorator @Permissions', () => {
      const permissions = reflector.get(PERMISSIONS_KEY, TestController.prototype.noPermissionsRoute);
      expect(permissions).toBeUndefined();
    });
  });

  describe('@Public Decorator', () => {
    @Controller('test')
    class TestController {
      @Get('public')
      @Public()
      publicRoute() {
        return 'public content';
      }

      @Get('private')
      privateRoute() {
        return 'private content';
      }
    }

    it('deve marcar rota como pública', () => {
      const isPublic = reflector.get(IS_PUBLIC_KEY, TestController.prototype.publicRoute);
      expect(isPublic).toBe(true);
    });

    it('deve retornar undefined para rotas não marcadas como públicas', () => {
      const isPublic = reflector.get(IS_PUBLIC_KEY, TestController.prototype.privateRoute);
      expect(isPublic).toBeUndefined();
    });
  });

  describe('@User Decorator', () => {
    it('deve ser uma função', () => {
      const userDecorator = User();
      expect(typeof userDecorator).toBe('function');
    });

    it('deve ser um decorator válido do NestJS', () => {
      expect(User).toBeDefined();
      expect(typeof User).toBe('function');
    });
  });

  describe('Combinação de Decorators', () => {
    @Controller('test')
    class TestController {
      @Get('admin-with-permissions')
      @Roles('admin')
      @Permissions('system.manage', 'users.delete')
      adminWithPermissionsRoute() {
        return 'admin with permissions content';
      }

      @Get('public-but-with-role')
      @Public()
      @Roles('admin')
      publicButWithRoleRoute() {
        return 'public content';
      }
    }

    it('deve permitir combinação de @Roles e @Permissions', () => {
      const roles = reflector.get(ROLES_KEY, TestController.prototype.adminWithPermissionsRoute);
      const permissions = reflector.get(PERMISSIONS_KEY, TestController.prototype.adminWithPermissionsRoute);

      expect(roles).toEqual(['admin']);
      expect(permissions).toEqual(['system.manage', 'users.delete']);
    });

    it('deve permitir @Public() combinado com outros decorators', () => {
      const isPublic = reflector.get(IS_PUBLIC_KEY, TestController.prototype.publicButWithRoleRoute);
      const roles = reflector.get(ROLES_KEY, TestController.prototype.publicButWithRoleRoute);

      expect(isPublic).toBe(true);
      expect(roles).toEqual(['admin']);
    });
  });
}); 