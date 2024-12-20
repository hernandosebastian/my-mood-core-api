import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { UpdateUserDto } from '@iam/user/application/dto/update-user.dto';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('User Module', () => {
  let app: INestApplication;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  beforeAll(async () => {
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication({ logger: false });
    setupApp(app);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET - /user/me', () => {
    it('should return current user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            username: 'admin@test.com',
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH - /user/me', () => {
    it('should update a user with valid data', async () => {
      const updateUserDto: UpdateUserDto = {
        nickname: 'updated-nickname',
        avatarSrc: 'updated-avatar-src',
      };

      await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .auth(adminToken, { type: 'bearer' })
        .send(updateUserDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(Number),
            username: expect.any(String),
            nickname: 'updated-nickname',
            avatarSrc: 'updated-avatar-src',
            externalId: expect.any(String),
            roles: expect.arrayContaining([expect.any(String)]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          });
        });
    });

    it('should return a validation error for invalid nickname', async () => {
      const updateUserDto: UpdateUserDto = {
        nickname: 'a'.repeat(50),
      };

      await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .auth(adminToken, { type: 'bearer' })
        .send(updateUserDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'nickname must be shorter than or equal to 35 characters',
          ]);
        });
    });

    it('should return a validation error if nickname is already taken', async () => {
      const updateUserDto: UpdateUserDto = {
        nickname: 'regular',
      };

      await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .auth(adminToken, { type: 'bearer' })
        .send(updateUserDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.message).toEqual('regular nickname is already taken');
        });
    });
  });
});
