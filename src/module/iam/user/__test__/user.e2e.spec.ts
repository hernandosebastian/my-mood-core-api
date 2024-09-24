import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';
import { loadFixtures } from '@data/util/fixture-loader';

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

  describe('GET - /user', () => {
    it('should return paginated users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                username: expect.any(String),
                externalId: expect.any(String),
                roles: expect.arrayContaining([expect.any(String)]),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deletedAt: null,
              }),
            ]),
            pageNumber: expect.any(Number),
            pageSize: expect.any(Number),
            pageCount: expect.any(Number),
            itemCount: expect.any(Number),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should allow to filter by attributes', async () => {
      const username = 'admin@test.com';

      await request(app.getHttpServer())
        .get(`/api/v1/user?filter[username]=${username}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                username,
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should allow to sort by attributes', async () => {
      const firstUser = { username: '' } as UserResponseDto;
      const lastUser = { username: '' } as UserResponseDto;
      let pageCount: number;

      await request(app.getHttpServer())
        .get('/api/v1/user?sort[username]=DESC')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          firstUser.username = body.data[0].username;
          pageCount = body.pageCount;
        });

      await request(app.getHttpServer())
        .get(`/api/v1/user?sort[username]=ASC&page[number]=${pageCount}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resources = body.data;
          lastUser.username = resources[resources.length - 1].username;
          expect(lastUser.username).toBe(firstUser.username);
        });
    });

    it('should allow to select specific attributes', async () => {
      const attributes = [
        'username',
        'externalId',
        'roles',
      ] as (keyof UserResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/user?fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resource = body.data[0];
          expect(Object.keys(resource).length).toBe(attributes.length);
          expect(resource).toEqual({
            username: expect.any(String),
            externalId: expect.any(String),
            roles: expect.arrayContaining([expect.any(String)]),
          });
        });
    });
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
});
