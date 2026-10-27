import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FarmsService } from '../farms/farms.service';
import { CropsService } from './crops.service';
import { Crop } from './entities/crop.entity';

const OWNER = 'owner-1';
const OTHER = 'owner-2';

describe('CropsService (pertenencia a finca)', () => {
  let service: CropsService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
  };
  let farmsService: { findOne: jest.Mock };

  const ownCrop = (): Crop =>
    ({ id: 'crop-1', farmId: 'farm-1', farm: { id: 'farm-1' } }) as Crop;

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto: Partial<Crop>) => ({ ...dto })),
      save: jest.fn((crop: Crop) => Promise.resolve(crop)),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      merge: jest.fn((target: Crop, src: Partial<Crop>) =>
        Object.assign(target, src),
      ),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    // Simula FarmsService.findOne: solo farm-1 y farm-2 son del OWNER.
    farmsService = {
      findOne: jest.fn((id: string, ownerId: string) =>
        ownerId === OWNER && ['farm-1', 'farm-2'].includes(id)
          ? Promise.resolve({ id, ownerId })
          : Promise.reject(new NotFoundException()),
      ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CropsService,
        { provide: getRepositoryToken(Crop), useValue: repo },
        { provide: FarmsService, useValue: farmsService },
      ],
    }).compile();

    service = moduleRef.get(CropsService);
  });

  describe('create', () => {
    it('crea el cultivo en una finca propia', async () => {
      await service.create(OWNER, { farmId: 'farm-1', species: 'Café' });
      expect(farmsService.findOne).toHaveBeenCalledWith('farm-1', OWNER);
      expect(repo.save).toHaveBeenCalled();
    });

    it('rechaza con 404 una finca ajena y no guarda nada', async () => {
      await expect(
        service.create(OTHER, { farmId: 'farm-1', species: 'Café' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('sin farmId filtra por el dueño de la finca', async () => {
      await service.findAll(OWNER);
      expect(farmsService.findOne).not.toHaveBeenCalled();
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { farm: { ownerId: OWNER } } }),
      );
    });

    it('con farmId propio filtra por finca y dueño', async () => {
      await service.findAll(OWNER, 'farm-1');
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { farmId: 'farm-1', farm: { ownerId: OWNER } },
        }),
      );
    });

    it('con farmId ajeno responde 404 sin consultar cultivos', async () => {
      await expect(service.findAll(OTHER, 'farm-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('busca por id y dueño de la finca', async () => {
      repo.findOne.mockResolvedValue(ownCrop());
      await expect(service.findOne('crop-1', OWNER)).resolves.toMatchObject({
        id: 'crop-1',
      });
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'crop-1', farm: { ownerId: OWNER } },
        }),
      );
    });

    it('responde 404 si el cultivo no existe o es de otro usuario', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('crop-1', OTHER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('responde 404 al editar un cultivo ajeno y no guarda', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.update('crop-1', OTHER, { notes: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('edita sin cambiar de finca sin volver a validarla', async () => {
      repo.findOne.mockResolvedValue(ownCrop());
      const result = await service.update('crop-1', OWNER, {
        farmId: 'farm-1',
        notes: 'regado',
      });
      expect(farmsService.findOne).not.toHaveBeenCalled();
      expect(result.notes).toBe('regado');
    });

    it('permite mover el cultivo a otra finca propia', async () => {
      repo.findOne.mockResolvedValue(ownCrop());
      const result = await service.update('crop-1', OWNER, {
        farmId: 'farm-2',
      });
      expect(farmsService.findOne).toHaveBeenCalledWith('farm-2', OWNER);
      expect(result.farmId).toBe('farm-2');
      // La relación cargada también apunta a la nueva finca, para que
      // TypeORM no persista el farm_id viejo.
      expect(result.farm.id).toBe('farm-2');
    });

    it('rechaza con 404 mover el cultivo a una finca ajena', async () => {
      repo.findOne.mockResolvedValue(ownCrop());
      await expect(
        service.update('crop-1', OWNER, { farmId: 'farm-de-otro' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('borra un cultivo propio', async () => {
      const crop = ownCrop();
      repo.findOne.mockResolvedValue(crop);
      await service.remove('crop-1', OWNER);
      expect(repo.remove).toHaveBeenCalledWith(crop);
    });

    it('responde 404 al borrar un cultivo ajeno y no borra nada', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('crop-1', OTHER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
