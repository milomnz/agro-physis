import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CropsService } from '../crops/crops.service';
import { Pest } from './entities/pest.entity';
import { PestsService } from './pests.service';

const OWNER = 'owner-1';
const OTHER = 'owner-2';

describe('PestsService (pertenencia a finca)', () => {
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

  const ownPest = (): Pest =>
    ({ id: 'pest-1', cropId: 'crop-1', crop: { id: 'crop-1' } }) as Pest;

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto: Partial<Pest>) => ({ ...dto })),
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
          ? Promise.resolve({ id })
          : Promise.reject(new NotFoundException()),
      ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PestsService,
        { provide: getRepositoryToken(Pest), useValue: repo },
        { provide: CropsService, useValue: cropsService },
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
    });

    it('edita sin cambiar de cultivo sin volver a validarlo', async () => {
      repo.findOne.mockResolvedValue(ownPest());
      const result = await service.update('pest-1', OWNER, {
        cropId: 'crop-1',
        commonName: 'Roya',
      });
      expect(cropsService.findOne).not.toHaveBeenCalled();
      expect(result.commonName).toBe('Roya');
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
