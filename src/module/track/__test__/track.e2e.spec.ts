import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { ICreateTrackDto } from '@/module/track/application/dto/create-track.dto.interface';
import { IGetTrackStatsResponseDto } from '@/module/track/application/dto/get-track-stats-response.interface';
import { GetTracksByDateRangeDto } from '@/module/track/application/dto/get-tracks-by-date-range.dto';
import { UpdateTrackDto } from '@/module/track/application/dto/update-track.dto';
import { Mood } from '@/module/track/application/enum/mood.enum';

describe('Track Module', () => {
  let app: INestApplication;

  const userOneToken = createAccessToken({
    sub: '00000000-0000-0000-0000-000000000ID1',
    username: 'johnDoe',
  });

  const userTwoToken = createAccessToken({
    sub: '00000000-0000-0000-0000-000000000ID2',
    username: 'janeDoe',
  });

  beforeAll(async () => {
    const fixtureOrder = ['User', 'Track'];
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions, fixtureOrder);
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

  describe('GET - /track/stats', () => {
    const userThreeToken = createAccessToken({
      sub: '00000000-0000-0000-0000-000000000ID3',
      username: 'bobDoe',
    });

    const userFourToken = createAccessToken({
      sub: '00000000-0000-0000-0000-000000000ID4',
      username: 'aliceDoe',
    });

    it('should return track stats without tracks', async () => {
      const getTracksByDateRangeDto: GetTracksByDateRangeDto = {
        startDate: '2024-10-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
      };

      const expectedResponse: IGetTrackStatsResponseDto = {
        totalTrackStats: [],
        tracksLast3MonthsStats: [],
      };

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/stats?startDate=${getTracksByDateRangeDto.startDate}&endDate=${getTracksByDateRangeDto.endDate}`,
        )
        .auth(userThreeToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should return track stats with tracks', async () => {
      const getTracksByDateRangeDto: GetTracksByDateRangeDto = {
        startDate: '2024-10-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
      };

      const expectedResponse: IGetTrackStatsResponseDto = {
        totalTrackStats: [
          { mood: 'Happy', totalTracks: 3 },
          { mood: 'Excited', totalTracks: 3 },
          { mood: 'Sad', totalTracks: 2 },
          { mood: 'Angry', totalTracks: 2 },
          { mood: 'Calm', totalTracks: 1 },
        ],
        tracksLast3MonthsStats: [
          {
            year: 2024,
            month: 12,
            moods: [{ mood: 'Happy', totalTracks: 3 }],
          },
          {
            year: 2024,
            month: 11,
            moods: [
              { mood: 'Sad', totalTracks: 2 },
              { mood: 'Calm', totalTracks: 1 },
            ],
          },
          {
            year: 2024,
            month: 10,
            moods: [
              { mood: 'Angry', totalTracks: 2 },
              { mood: 'Excited', totalTracks: 1 },
            ],
          },
        ],
      };

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/stats?startDate=${getTracksByDateRangeDto.startDate}&endDate=${getTracksByDateRangeDto.endDate}`,
        )
        .auth(userFourToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should return track stats with total tracks stats but without last 3 months stats', async () => {
      const firstGetTracksByDateRangeDto: GetTracksByDateRangeDto = {
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.999Z',
      };

      const secondGetTracksByDateRangeDto: GetTracksByDateRangeDto = {
        startDate: '2021-10-01T00:00:00.000Z',
        endDate: '2021-12-31T23:59:59.999Z',
      };

      const expectedResponse: IGetTrackStatsResponseDto = {
        totalTrackStats: [
          { mood: 'Happy', totalTracks: 3 },
          { mood: 'Excited', totalTracks: 3 },
          { mood: 'Sad', totalTracks: 2 },
          { mood: 'Angry', totalTracks: 2 },
          { mood: 'Calm', totalTracks: 1 },
        ],
        tracksLast3MonthsStats: [],
      };

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/stats?startDate=${firstGetTracksByDateRangeDto.startDate}&endDate=${firstGetTracksByDateRangeDto.endDate}`,
        )
        .auth(userFourToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual(expectedResponse);
        });

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/stats?startDate=${secondGetTracksByDateRangeDto.startDate}&endDate=${secondGetTracksByDateRangeDto.endDate}`,
        )
        .auth(userFourToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('GET - /track/by-date-range', () => {
    it('should return all tracks by date range', async () => {
      const getTracksByDateRangeDto: GetTracksByDateRangeDto = {
        startDate: '2024-10-30T12:34:56.789Z',
        endDate: '2024-10-31T12:34:56.789Z',
      };

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/by-date-range?startDate=${getTracksByDateRangeDto.startDate}&endDate=${getTracksByDateRangeDto.endDate}`,
        )
        .auth(userOneToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual([
            {
              id: expect.any(Number),
              title: expect.any(String),
              description: expect.any(String),
              date: expect.any(String),
              ownerId: expect.any(Number),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              deletedAt: null,
            },
          ]);
        });
    });

    it('should return all tracks by date range', async () => {
      const getTracksByDateRangeDto: GetTracksByDateRangeDto = {
        startDate: '2024-10-29T12:34:56.789Z',
        endDate: '2024-10-31T12:34:56.789Z',
      };

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/by-date-range?startDate=${getTracksByDateRangeDto.startDate}&endDate=${getTracksByDateRangeDto.endDate}`,
        )
        .auth(userOneToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual([
            {
              id: expect.any(Number),
              title: expect.any(String),
              description: expect.any(String),
              date: expect.any(String),
              ownerId: expect.any(Number),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              deletedAt: null,
            },
            {
              id: expect.any(Number),
              title: expect.any(String),
              description: expect.any(String),
              date: expect.any(String),
              ownerId: expect.any(Number),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              deletedAt: null,
            },
          ]);
        });
    });

    it('should return empty array there are no tracks by date range', async () => {
      const getTracksByDateRangeDto: GetTracksByDateRangeDto = {
        startDate: '2024-11-10T12:34:56.789Z',
        endDate: '2024-11-20T12:34:56.789Z',
      };

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/by-date-range?startDate=${getTracksByDateRangeDto.startDate}&endDate=${getTracksByDateRangeDto.endDate}`,
        )
        .auth(userOneToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual([]);
        });
    });

    it('should return a validation error for invalid startDate and endDate', async () => {
      const invalidStartDate = 'invalidDate';
      const invalidEndDate = 'invalidDate';

      await request(app.getHttpServer())
        .get(
          `/api/v1/track/by-date-range?startDate=${invalidStartDate}&endDate=${invalidEndDate}`,
        )
        .auth(userOneToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'startDate must be a valid ISO 8601 date string',
            'endDate must be a valid ISO 8601 date string',
          ]);
        });
    });
  });

  describe('POST - /track', () => {
    it('should create a new track with valid data', async () => {
      const createTrackDto: ICreateTrackDto = {
        title: Mood.HAPPY,
        description: 'This is a new track',
        date: new Date('2024-11-15T12:34:56.789Z'),
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(Number),
            title: createTrackDto.title,
            description: createTrackDto.description,
            date: createTrackDto.date.toISOString(),
            ownerId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          });
        });
    });

    it('should return a validation error for title not valid enum', async () => {
      const createTrackDto = {
        title: 'Invalid Mood',
        description: 'This is a new track',
        date: new Date('2024-11-15T12:34:56.789Z'),
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'title must be one of the following values: Happy, Sad, Angry, Excited, Anxious, Calm, Confused, Bored',
          ]);
        });
    });

    it('should return a validation error for missing title', async () => {
      const createTrackDto = {
        description: 'This is a new track',
        date: new Date('2024-11-15T12:34:56.789Z'),
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'title must be one of the following values: Happy, Sad, Angry, Excited, Anxious, Calm, Confused, Bored',
            'title should not be empty',
            'title must be a string',
          ]);
        });
    });

    it('should return a validation error for missing date', async () => {
      const createTrackDto = {
        title: Mood.HAPPY,
        description: 'This is a new track',
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'date should not be empty',
            'date must be a Date instance',
          ]);
        });
    });

    it('should return a validation error for invalid date format', async () => {
      const createTrackDto = {
        title: Mood.HAPPY,
        description: 'This is a new track',
        date: 'invalidDate',
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual(['date must be a Date instance']);
        });
    });

    it('should return a validation error for too long description', async () => {
      const createTrackDto: ICreateTrackDto = {
        title: Mood.HAPPY,
        description: 'a'.repeat(201),
        date: new Date('2024-11-15T12:34:56.789Z'),
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'description must be shorter than or equal to 200 characters',
          ]);
        });
    });

    it('should return an error when trying to create a track on an existing date', async () => {
      const existingTrackDate = new Date('2024-10-31T12:34:56.789Z');

      const createTrackDto: ICreateTrackDto = {
        title: Mood.HAPPY,
        description: 'This track has a conflicting date',
        date: existingTrackDate,
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.message).toEqual(
            `A track already exists for the date ${existingTrackDate.toDateString()}`,
          );
        });
    });
  });

  describe('PATCH - /track/:id', () => {
    it('should update a track with valid data', async () => {
      const updateTrackDto: UpdateTrackDto = {
        title: Mood.HAPPY,
        description: 'Updated description for the track',
      };

      const trackId = 1;

      await request(app.getHttpServer())
        .patch(`/api/v1/track/${trackId}`)
        .auth(userOneToken, { type: 'bearer' })
        .send(updateTrackDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual({
            id: trackId,
            title: updateTrackDto.title,
            description: updateTrackDto.description,
            date: expect.any(String),
            ownerId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          });
        });
    });

    it('should return a validation error for title not valid enum', async () => {
      const createTrackDto = {
        title: 'Invalid Mood',
      };

      await request(app.getHttpServer())
        .post('/api/v1/track')
        .auth(userOneToken, { type: 'bearer' })
        .send(createTrackDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'title must be one of the following values: Happy, Sad, Angry, Excited, Anxious, Calm, Confused, Bored',
            'date should not be empty',
            'date must be a Date instance',
          ]);
        });
    });

    it('should return a validation error for invalid description', async () => {
      const updateTrackDto = {
        description: 'a'.repeat(201),
      };

      const trackId = 1;

      await request(app.getHttpServer())
        .patch(`/api/v1/track/${trackId}`)
        .auth(userOneToken, { type: 'bearer' })
        .send(updateTrackDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toEqual([
            'description must be shorter than or equal to 200 characters',
          ]);
        });
    });

    it('should not allow updating a track if the user is not the owner', async () => {
      const updateTrackDto: UpdateTrackDto = {
        title: Mood.HAPPY,
      };

      const trackId = 2;
      await request(app.getHttpServer())
        .patch(`/api/v1/track/${trackId}`)
        .auth(userTwoToken, { type: 'bearer' })
        .send(updateTrackDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toEqual('You do not own this resource');
        });
    });

    it('should return a not found error for a non-existing track', async () => {
      const updateTrackDto: UpdateTrackDto = {
        title: Mood.HAPPY,
      };

      const nonExistingTrackId = 9999;

      await request(app.getHttpServer())
        .patch(`/api/v1/track/${nonExistingTrackId}`)
        .auth(userOneToken, { type: 'bearer' })
        .send(updateTrackDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toEqual(
            `Track with ID ${nonExistingTrackId} not found`,
          );
        });
    });
  });

  describe('DELETE - /track/:id', () => {
    it('should delete a track successfully if the user is the owner', async () => {
      const trackId = 1;

      await request(app.getHttpServer())
        .delete(`/api/v1/track/${trackId}`)
        .auth(userOneToken, { type: 'bearer' })
        .expect(HttpStatus.OK);
    });

    it('should return a forbidden error if the user is not the owner', async () => {
      const trackId = 2;

      await request(app.getHttpServer())
        .delete(`/api/v1/track/${trackId}`)
        .auth(userTwoToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toEqual('You do not own this resource');
        });
    });

    it('should return a not found error for a non-existing track', async () => {
      const nonExistingTrackId = 9999;

      await request(app.getHttpServer())
        .delete(`/api/v1/track/${nonExistingTrackId}`)
        .auth(userOneToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toEqual(
            `Track with ID ${nonExistingTrackId} not found`,
          );
        });
    });
  });
});
