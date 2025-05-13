import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Autenticação (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve criar um novo usuário', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Teste',
        lastName: 'E2E',
        email: 'teste.e2e@exemplo.com',
        username: 'testee2e',
        password: 'senha123'
      })
      .expect(201)
      .then(response => {
        userId = response.body.id;
      });
  });

  it('deve autenticar e retornar um token JWT', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testee2e',
        password: 'senha123'
      })
      .expect(201)
      .then(response => {
        expect(response.body).toHaveProperty('access_token');
        authToken = response.body.access_token;
      });
  });

  it('deve acessar uma rota protegida com o token JWT', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('deve excluir o usuário de teste', () => {
    return request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
}); 