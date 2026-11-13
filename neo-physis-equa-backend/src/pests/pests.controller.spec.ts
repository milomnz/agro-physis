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
import { PestsController } from './pests.controller';
import { PestsService } from './pests.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const CROP_ID = '33333333-3333-4333-8333-333333333333';
const PEST_ID = '44444444-4444-4444-8444-444444444444';

describe('PestsController (HTTP)', () => {
  let app: INestApplication<App>;
  let service: Record<
    'create' | 'findAll' | 'findOne' | 'update' | 'remove',
    jest.Mock
  >;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: PEST_ID }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: PEST_ID }),
      update: jest.fn().mockResolvedValue({ id: PEST_ID }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [PestsController],
      providers: [{ provide: PestsService, useValue: service }],
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

  it('GET /api/pests lista solo las plagas del usuario', async () => {
    await request(app.getHttpServer()).get('/api/pests').expect(200);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID, undefined);
  });

  it('GET /api/pests?cropId= pasa el cultivo y el usuario', async () => {
    await request(app.getHttpServer())
      .get(`/api/pests?cropId=${CROP_ID}`)
      .expect(200);
    expect(service.findAll).toHaveBeenCalledWith(USER_ID, CROP_ID);
  });

  it('GET /api/pests?cropId=no-uuid responde 400', async () => {
    await request(app.getHttpServer())
      .get('/api/pests?cropId=no-uuid')
      .expect(400);
    expect(service.findAll).not.toHaveBeenCalled();
  });

  it('GET /api/pests?cropId de otro usuario responde 404', async () => {
    service.findAll.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .get(`/api/pests?cropId=${CROP_ID}`)
      .expect(404);
  });

  it('POST /api/pests crea con el usuario autenticado', async () => {
    const body = { cropId: CROP_ID, commonName: 'Broca' };
    await request(app.getHttpServer())
      .post('/api/pests')
      .send(body)
      .expect(201);
    expect(service.create).toHaveBeenCalledWith(USER_ID, body);
  });

  it('POST /api/pests en cultivo ajeno responde 404', async () => {
    service.create.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .post('/api/pests')
      .send({ cropId: CROP_ID, commonName: 'Broca' })
      .expect(404);
  });

  it('GET /api/pests/:id pasa el usuario', async () => {
    await request(app.getHttpServer()).get(`/api/pests/${PEST_ID}`).expect(200);
    expect(service.findOne).toHaveBeenCalledWith(PEST_ID, USER_ID);
  });

  it('GET /api/pests/:id ajeno responde 404', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer()).get(`/api/pests/${PEST_ID}`).expect(404);
  });

  it('GET /api/pests/:id con id inválido responde 400', async () => {
    await request(app.getHttpServer()).get('/api/pests/abc').expect(400);
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('PATCH /api/pests/:id pasa el usuario', async () => {
    await request(app.getHttpServer())
      .patch(`/api/pests/${PEST_ID}`)
      .send({ commonName: 'Roya' })
      .expect(200);
    expect(service.update).toHaveBeenCalledWith(PEST_ID, USER_ID, {
      commonName: 'Roya',
    });
  });

  it('PATCH /api/pests/:id ajeno responde 404', async () => {
    service.update.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .patch(`/api/pests/${PEST_ID}`)
      .send({ commonName: 'Roya' })
      .expect(404);
  });

  it('DELETE /api/pests/:id pasa el usuario', async () => {
    await request(app.getHttpServer())
      .delete(`/api/pests/${PEST_ID}`)
      .expect(200);
    expect(service.remove).toHaveBeenCalledWith(PEST_ID, USER_ID);
  });

  it('DELETE /api/pests/:id ajeno responde 404', async () => {
    service.remove.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .delete(`/api/pests/${PEST_ID}`)
      .expect(404);
  });
});
