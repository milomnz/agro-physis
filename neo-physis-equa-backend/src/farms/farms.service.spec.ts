import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { FarmsService } from './farms.service';

const OWNER = 'owner-1';
const OTHER = 'owner-2';

describe('FarmsService (pertenencia)', () => {
  let service: FarmsService;
  let repo: {
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn((farm: Farm) => Promise.resolve(farm)),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        FarmsService,
        { provide: getRepositoryToken(Farm), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(FarmsService);
  });

  it('findOne siempre filtra por id y dueño', async () => {
    repo.findOne.mockResolvedValue({ id: 'farm-1', ownerId: OWNER });
    await service.findOne('farm-1', OWNER);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 'farm-1', ownerId: OWNER },
    });
  });

  it('findOne responde 404 si la finca es de otro usuario', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('farm-1', OTHER)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update de una finca ajena responde 404 y no guarda', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.update('farm-1', OTHER, { name: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('remove de una finca ajena responde 404 y no borra', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove('farm-1', OTHER)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repo.remove).not.toHaveBeenCalled();
  });
});
