import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FarmsController } from './farms.controller';
import { FarmsService } from './farms.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const FARM_ID = '22222222-2222-4222-8222-222222222222';

describe('FarmsController (HTTP)', () => {
  let app: INestApplication<App>;
  let service: Record<'findOne' | 'update' | 'remove', jest.Mock>;

  beforeEach(async () => {
    service = {
      findOne: jest.fn().mockResolvedValue({ id: FARM_ID }),
      update: jest.fn().mockResolvedValue({ id: FARM_ID }),
      remove: jest.fn().mockResolvedValue({ message: 'ok' }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [FarmsController],
      providers: [{ provide: FarmsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest<{ user?: { id: string } }>().user = {
            id: USER_ID,
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(() => app.close());

  it('GET /api/farms/:id pasa el id y el usuario', async () => {
    await request(app.getHttpServer()).get(`/api/farms/${FARM_ID}`).expect(200);
    expect(service.findOne).toHaveBeenCalledWith(FARM_ID, USER_ID);
  });

  it.each([
    ['GET', 'get'],
    ['PATCH', 'patch'],
    ['DELETE', 'delete'],
  ] as const)(
    '%s /api/farms/:id con id inválido responde 400',
    async (_label, method) => {
      await request(app.getHttpServer())[method]('/api/farms/abc').expect(400);
      expect(service.findOne).not.toHaveBeenCalled();
      expect(service.update).not.toHaveBeenCalled();
      expect(service.remove).not.toHaveBeenCalled();
    },
  );
});
