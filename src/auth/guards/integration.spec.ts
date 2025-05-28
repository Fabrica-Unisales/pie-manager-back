import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication, UseGuards } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import * as request from 'supertest';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../../users/users.service';
import { Roles, Permissions, Public, User } from '../../common/decorators';

@Controller('test')
@UseGuards(AuthGuard)
class TestController {
  @Get('public')
  @Public()
  publicRoute() {
    return { message: 'Rota pública funcionando!' };
  }

  @Get('authenticated')
  authenticatedRoute(@User() user: any) {
    return { 
      message: 'Usuário autenticado!', 
      user: { id: user.id, email: user.email } 
    };
  }

  @Get('admin-only')
  @Roles('admin')
  adminOnlyRoute() {
    return { message: 'Apenas admins podem ver isso!' };
  }

  @Get('manager-or-admin')
  @Roles('admin', 'manager')
  managerOrAdminRoute() {
    return { message: 'Managers ou admins podem ver isso!' };
  }

  @Get('with-permission')
  @Permissions('users.read')
  withPermissionRoute() {
    return { message: 'Usuário tem permissão users.read!' };
  }

  @Get('admin-with-permission')
  @Roles('admin')
  @Permissions('system.manage')
  adminWithPermissionRoute() {
    return { message: 'Admin com permissão system.manage!' };
  }
}

describe('Sistema de Controle de Acesso - Integração', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersService: jest.Mocked<UsersService>;

  let adminToken: string;
  let managerToken: string;
  let userToken: string;
  let userWithPermissionToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [TestController],
      providers: [
        AuthGuard,
        {
          provide: UsersService,
          useValue: {
            findOneWithRolesAndPermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    usersService = moduleFixture.get(UsersService);

    adminToken = jwtService.sign({ sub: 1, email: 'admin@test.com' });
    managerToken = jwtService.sign({ sub: 2, email: 'manager@test.com' });
    userToken = jwtService.sign({ sub: 3, email: 'user@test.com' });
    userWithPermissionToken = jwtService.sign({ sub: 4, email: 'user-perm@test.com' });

    usersService.findOneWithRolesAndPermissions.mockImplementation((id: number) => {
      const users = {
        1: { id: 1, email: 'admin@test.com', roles: ['admin'], permissions: ['system.manage'] },
        2: { id: 2, email: 'manager@test.com', roles: ['manager'], permissions: [] },
        3: { id: 3, email: 'user@test.com', roles: ['user'], permissions: [] },
        4: { id: 4, email: 'user-perm@test.com', roles: ['user'], permissions: ['users.read'] },
      };
      return Promise.resolve(users[id] || null);
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Rota Pública (@Public)', () => {
    it('deve permitir acesso sem token', () => {
      return request(app.getHttpServer())
        .get('/test/public')
        .expect(200)
        .expect({ message: 'Rota pública funcionando!' });
    });

    it('deve permitir acesso mesmo com token', () => {
      return request(app.getHttpServer())
        .get('/test/public')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect({ message: 'Rota pública funcionando!' });
    });
  });

  describe('Rota Autenticada (apenas JWT)', () => {
    it('deve rejeitar acesso sem token', () => {
      return request(app.getHttpServer())
        .get('/test/authenticated')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Token de acesso não fornecido');
        });
    });

    it('deve permitir acesso com token válido', () => {
      return request(app.getHttpServer())
        .get('/test/authenticated')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário autenticado!');
          expect(res.body.user.email).toBe('user@test.com');
        });
    });
  });

  describe('Controle por Papéis (@Roles)', () => {
    it('deve permitir admin acessar rota admin-only', () => {
      return request(app.getHttpServer())
        .get('/test/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect({ message: 'Apenas admins podem ver isso!' });
    });

    it('deve rejeitar usuário comum em rota admin-only', () => {
      return request(app.getHttpServer())
        .get('/test/admin-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Acesso negado: papel insuficiente');
        });
    });

    it('deve permitir admin OU manager em rota manager-or-admin', () => {
      return request(app.getHttpServer())
        .get('/test/manager-or-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect({ message: 'Managers ou admins podem ver isso!' })
        .then(() => {
          return request(app.getHttpServer())
            .get('/test/manager-or-admin')
            .set('Authorization', `Bearer ${managerToken}`)
            .expect(200)
            .expect({ message: 'Managers ou admins podem ver isso!' });
        });
    });

    it('deve rejeitar usuário comum em rota manager-or-admin', () => {
      return request(app.getHttpServer())
        .get('/test/manager-or-admin')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Acesso negado: papel insuficiente');
        });
    });
  });

  describe('Controle por Permissões (@Permissions)', () => {
    it('deve permitir usuário com permissão users.read', () => {
      return request(app.getHttpServer())
        .get('/test/with-permission')
        .set('Authorization', `Bearer ${userWithPermissionToken}`)
        .expect(200)
        .expect({ message: 'Usuário tem permissão users.read!' });
    });

    it('deve rejeitar usuário sem permissão users.read', () => {
      return request(app.getHttpServer())
        .get('/test/with-permission')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Acesso negado: permissão insuficiente');
        });
    });
  });

  describe('Combinação Papéis + Permissões', () => {
    it('deve permitir admin com permissão system.manage', () => {
      return request(app.getHttpServer())
        .get('/test/admin-with-permission')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect({ message: 'Admin com permissão system.manage!' });
    });

    it('deve rejeitar manager sem permissão system.manage', () => {
      return request(app.getHttpServer())
        .get('/test/admin-with-permission')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Acesso negado: papel insuficiente');
        });
    });

    it('deve rejeitar usuário comum mesmo com outras permissões', () => {
      return request(app.getHttpServer())
        .get('/test/admin-with-permission')
        .set('Authorization', `Bearer ${userWithPermissionToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toBe('Acesso negado: papel insuficiente');
        });
    });
  });

  describe('Tokens Inválidos', () => {
    it('deve rejeitar token malformado', () => {
      return request(app.getHttpServer())
        .get('/test/authenticated')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Token inválido');
        });
    });

    it('deve rejeitar header Authorization inválido', () => {
      return request(app.getHttpServer())
        .get('/test/authenticated')
        .set('Authorization', 'Basic dGVzdA==')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Token de acesso não fornecido');
        });
    });
  });
});