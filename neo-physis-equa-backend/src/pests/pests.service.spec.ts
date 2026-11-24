import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CropsService } from '../crops/crops.service';
import { NOTIFICADOR_PORT } from '../notifications/ports/notificador.port';
import { Pest, Severity } from './entities/pest.entity';
import { PestsService } from './pests.service';

const OWNER = 'owner-1';
const OTHER = 'owner-2';

describe('PestsService (pertenencia a finca y notificaciones)', () => {
  let service: PestsService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
  };
  let cropsService: { findOne: jest.Mock };
  let notificador: { avisar: jest.Mock };

  const ownPest = (overrides: Partial<Pest> = {}): Pest =>
    ({
      id: 'pest-1',
      cropId: 'crop-1',
      commonName: 'Broca',
      severity: Severity.BAJA,
      crop: { id: 'crop-1', species: 'Café' },
      ...overrides,
    }) as Pest;

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto: Partial<Pest>) => ({ id: 'pest-new', ...dto })),
      save: jest.fn((pest: Pest) => Promise.resolve(pest)),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      merge: jest.fn((target: Pest, src: Partial<Pest>) =>
        Object.assign(target, src),
      ),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    // Simula CropsService.findOne: crop-1 y crop-2 están en fincas del OWNER.
    cropsService = {
      findOne: jest.fn((id: string, ownerId: string) =>
        ownerId === OWNER && ['crop-1', 'crop-2'].includes(id)
          ? Promise.resolve({
              id,
              species: id === 'crop-1' ? 'Café' : 'Cacao',
            })
          : Promise.reject(new NotFoundException()),
      ),
    };
    notificador = {
      avisar: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PestsService,
        { provide: getRepositoryToken(Pest), useValue: repo },
        { provide: CropsService, useValue: cropsService },
        { provide: NOTIFICADOR_PORT, useValue: notificador },
      ],
    }).compile();

    service = moduleRef.get(PestsService);
  });

  describe('create', () => {
    it('crea la plaga en un cultivo propio', async () => {
      await service.create(OWNER, { cropId: 'crop-1', commonName: 'Broca' });
      expect(cropsService.findOne).toHaveBeenCalledWith('crop-1', OWNER);
      expect(repo.save).toHaveBeenCalled();
    });

    it('rechaza con 404 un cultivo ajeno y no guarda nada', async () => {
      await expect(
        service.create(OTHER, { cropId: 'crop-1', commonName: 'Broca' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
      expect(notificador.avisar).not.toHaveBeenCalled();
    });

    it('envía notificación push cuando la severidad es ALTA', async () => {
      await service.create(OWNER, {
        cropId: 'crop-1',
        commonName: 'Broca',
        severity: Severity.ALTA,
      });

      expect(notificador.avisar).toHaveBeenCalledWith(OWNER, {
        titulo: 'Alerta alta en Café',
        cuerpo: 'Se registró Broca. Toca para ver el detalle.',
        datos: {
          tipo: 'pest',
          pestId: 'pest-new',
          cropId: 'crop-1',
          severity: Severity.ALTA,
          route: '/pests/pest-new',
        },
      });
    });

    it('envía notificación push cuando la severidad es MEDIA', async () => {
      await service.create(OWNER, {
        cropId: 'crop-1',
        commonName: 'Roya',
        severity: Severity.MEDIA,
      });

      expect(notificador.avisar).toHaveBeenCalledWith(OWNER, {
        titulo: 'Alerta media en Café',
        cuerpo: 'Se registró Roya. Toca para ver el detalle.',
        datos: {
          tipo: 'pest',
          pestId: 'pest-new',
          cropId: 'crop-1',
          severity: Severity.MEDIA,
          route: '/pests/pest-new',
        },
      });
    });

    it('usa título de respaldo si el cultivo no tiene nombre de especie', async () => {
      cropsService.findOne.mockResolvedValueOnce({ id: 'crop-1', species: '' });

      await service.create(OWNER, {
        cropId: 'crop-1',
        commonName: 'Broca',
        severity: Severity.ALTA,
      });

      expect(notificador.avisar).toHaveBeenCalledWith(
        OWNER,
        expect.objectContaining({
          titulo: 'Alerta alta de plaga',
        }),
      );
    });

    it('NO envía notificación cuando la severidad es BAJA', async () => {
      await service.create(OWNER, {
        cropId: 'crop-1',
        commonName: 'Hormiga',
        severity: Severity.BAJA,
      });

      expect(notificador.avisar).not.toHaveBeenCalled();
    });

    it('no falla la creación si el notificador lanza un error (best-effort)', async () => {
      notificador.avisar.mockRejectedValueOnce(new Error('Expo down'));

      const saved = await service.create(OWNER, {
        cropId: 'crop-1',
        commonName: 'Broca',
        severity: Severity.ALTA,
      });

      expect(saved.commonName).toBe('Broca');
      expect(notificador.avisar).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('sin cropId filtra por el dueño de la finca del cultivo', async () => {
      await service.findAll(OWNER);
      expect(cropsService.findOne).not.toHaveBeenCalled();
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { crop: { farm: { ownerId: OWNER } } },
        }),
      );
    });

    it('con cropId propio filtra por cultivo y dueño', async () => {
      await service.findAll(OWNER, 'crop-1');
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cropId: 'crop-1', crop: { farm: { ownerId: OWNER } } },
        }),
      );
    });

    it('con cropId ajeno responde 404 sin consultar plagas', async () => {
      await expect(service.findAll(OTHER, 'crop-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('busca por id y dueño de la finca del cultivo', async () => {
      repo.findOne.mockResolvedValue(ownPest());
      await expect(service.findOne('pest-1', OWNER)).resolves.toMatchObject({
        id: 'pest-1',
      });
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pest-1', crop: { farm: { ownerId: OWNER } } },
        }),
      );
    });

    it('responde 404 si la plaga no existe o es de otro usuario', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('pest-1', OTHER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('responde 404 al editar una plaga ajena y no guarda', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.update('pest-1', OTHER, { commonName: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
      expect(notificador.avisar).not.toHaveBeenCalled();
    });

    it('edita sin cambiar de cultivo sin volver a validarlo', async () => {
      repo.findOne.mockResolvedValue(ownPest());
      const result = await service.update('pest-1', OWNER, {
        cropId: 'crop-1',
        commonName: 'Roya',
      });
      expect(cropsService.findOne).not.toHaveBeenCalled();
      expect(result.commonName).toBe('Roya');
      expect(notificador.avisar).not.toHaveBeenCalled();
    });

    it('permite mover la plaga a otro cultivo propio', async () => {
      repo.findOne.mockResolvedValue(ownPest());
      const result = await service.update('pest-1', OWNER, {
        cropId: 'crop-2',
      });
      expect(cropsService.findOne).toHaveBeenCalledWith('crop-2', OWNER);
      expect(result.cropId).toBe('crop-2');
      expect(result.crop.id).toBe('crop-2');
    });

    it('rechaza con 404 mover la plaga a un cultivo ajeno', async () => {
      repo.findOne.mockResolvedValue(ownPest());
      await expect(
        service.update('pest-1', OWNER, { cropId: 'crop-de-otro' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('envía alerta "Plaga en aumento" si la severidad sube de BAJA a ALTA', async () => {
      repo.findOne.mockResolvedValue(ownPest({ severity: Severity.BAJA }));

      await service.update('pest-1', OWNER, { severity: Severity.ALTA });

      expect(notificador.avisar).toHaveBeenCalledWith(OWNER, {
        titulo: 'Plaga en aumento',
        cuerpo: 'Broca en Café pasó de baja a alta.',
        datos: {
          tipo: 'pest-worsened',
          pestId: 'pest-1',
          cropId: 'crop-1',
          previousSeverity: Severity.BAJA,
          severity: Severity.ALTA,
          route: '/pests/pest-1',
        },
      });
    });

    it('envía alerta "Plaga en aumento" si la severidad sube de MEDIA a ALTA', async () => {
      repo.findOne.mockResolvedValue(ownPest({ severity: Severity.MEDIA }));

      await service.update('pest-1', OWNER, { severity: Severity.ALTA });

      expect(notificador.avisar).toHaveBeenCalledWith(OWNER, {
        titulo: 'Plaga en aumento',
        cuerpo: 'Broca en Café pasó de media a alta.',
        datos: {
          tipo: 'pest-worsened',
          pestId: 'pest-1',
          cropId: 'crop-1',
          previousSeverity: Severity.MEDIA,
          severity: Severity.ALTA,
          route: '/pests/pest-1',
        },
      });
    });

    it('NO envía notificación si la severidad no cambia o baja', async () => {
      repo.findOne.mockResolvedValue(ownPest({ severity: Severity.ALTA }));
      await service.update('pest-1', OWNER, { severity: Severity.ALTA });
      expect(notificador.avisar).not.toHaveBeenCalled();

      repo.findOne.mockResolvedValue(ownPest({ severity: Severity.ALTA }));
      await service.update('pest-1', OWNER, { severity: Severity.MEDIA });
      expect(notificador.avisar).not.toHaveBeenCalled();

      repo.findOne.mockResolvedValue(ownPest({ severity: Severity.ALTA }));
      await service.update('pest-1', OWNER, { severity: Severity.BAJA });
      expect(notificador.avisar).not.toHaveBeenCalled();
    });

    it('no falla la actualización si el notificador falla (best-effort)', async () => {
      repo.findOne.mockResolvedValue(ownPest({ severity: Severity.BAJA }));
      notificador.avisar.mockRejectedValueOnce(new Error('timeout'));

      const result = await service.update('pest-1', OWNER, {
        severity: Severity.MEDIA,
      });

      expect(result.severity).toBe(Severity.MEDIA);
      expect(notificador.avisar).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('borra una plaga propia', async () => {
      const pest = ownPest();
      repo.findOne.mockResolvedValue(pest);
      await service.remove('pest-1', OWNER);
      expect(repo.remove).toHaveBeenCalledWith(pest);
    });

    it('responde 404 al borrar una plaga ajena y no borra nada', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('pest-1', OTHER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
