import {
  ExecutionContext,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CropsController } from './crops.controller';
import { CropsService } from './crops.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const FARM_ID = '22222222-2222-4222-8222-222222222222';
const CROP_ID = '33333333-3333-4333-8333-333333333333';

describe('CropsController (HTTP)', () => {
  let app: INestApplication<App>;
  let service: Record<
    'create' | 'findAll' | 'findOne' | 'update' | 'remove',
    jest.Mock
  >;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: CROP_ID }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: CROP_ID }),
      update: jest.fn().mockResolvedValue({ id: CROP_ID }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [CropsController],
      providers: [{ provide: CropsService, useValue: service }],
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

  it('GET /api/crops lista solo los cultivos del usuario', async () => {
    await request(app.getHttpServer()).get('/api/crops').expect(200);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID, undefined);
  });

  it('GET /api/crops?farmId= pasa la finca y el usuario', async () => {
    await request(app.getHttpServer())
      .get(`/api/crops?farmId=${FARM_ID}`)
      .expect(200);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID, FARM_ID);
  });

  it('GET /api/crops?farmId=no-uuid responde 400', async () => {
    await request(app.getHttpServer())
      .get('/api/crops?farmId=no-uuid')
      .expect(400);
    expect(service.findAll).not.toHaveBeenCalled();
  });

  it('GET /api/crops?farmId de otra finca responde 404', async () => {
    service.findAll.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .get(`/api/crops?farmId=${FARM_ID}`)
      .expect(404);
  });

  it('POST /api/crops crea con el usuario autenticado', async () => {
    const body = { farmId: FARM_ID, species: 'Café' };
    await request(app.getHttpServer())
      .post('/api/crops')
      .send(body)
      .expect(201);
    expect(service.create).toHaveBeenCalledWith(USER_ID, body);
  });

  it('POST /api/crops en finca ajena responde 404', async () => {
    service.create.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .post('/api/crops')
      .send({ farmId: FARM_ID, species: 'Café' })
      .expect(404);
  });

  it('GET /api/crops/:id pasa el usuario', async () => {
    await request(app.getHttpServer()).get(`/api/crops/${CROP_ID}`).expect(200);
    expect(service.findOne).toHaveBeenCalledWith(CROP_ID, USER_ID);
  });

  it('GET /api/crops/:id ajeno responde 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer()).get(`/api/crops/${CROP_ID}`).expect(404);
  });

  it('GET /api/crops/:id con id inválido responde 400', async () => {
    await request(app.getHttpServer()).get('/api/crops/abc').expect(400);
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('PATCH /api/crops/:id pasa el usuario', async () => {
    await request(app.getHttpServer())
      .patch(`/api/crops/${CROP_ID}`)
      .send({ notes: 'regado' })
      .expect(200);
    expect(service.update).toHaveBeenCalledWith(CROP_ID, USER_ID, {
      notes: 'regado',
    });
  });

  it('PATCH /api/crops/:id ajeno responde 404', async () => {
    service.update.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .patch(`/api/crops/${CROP_ID}`)
      .send({ notes: 'regado' })
      .expect(404);
  });

  it('DELETE /api/crops/:id pasa el usuario', async () => {
    await request(app.getHttpServer())
      .delete(`/api/crops/${CROP_ID}`)
      .expect(200);
    expect(service.remove).toHaveBeenCalledWith(CROP_ID, USER_ID);
  });

  it('DELETE /api/crops/:id ajeno responde 404', async () => {
    service.remove.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .delete(`/api/crops/${CROP_ID}`)
      .expect(404);
  });
});
