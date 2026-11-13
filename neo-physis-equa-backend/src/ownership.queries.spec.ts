import { DataSource, SelectQueryBuilder } from 'typeorm';
import { CropsService } from './crops/crops.service';
import { Crop } from './crops/entities/crop.entity';
import { Farm } from './farms/entities/farm.entity';
import { FarmsService } from './farms/farms.service';
import { Pest } from './pests/entities/pest.entity';
import { PestsService } from './pests/pests.service';
import { User } from './users/entities/user.entity';

// Ejecuta los servicios reales contra repositorios de TypeORM sin conexión a
// la base: se intercepta el SQL generado para comprobar que de verdad se hace
// JOIN hasta la finca y se filtra por su owner_id.

const OWNER = '11111111-1111-4111-8111-111111111111';
const FARM = '22222222-2222-4222-8222-222222222222';
const CROP = '33333333-3333-4333-8333-333333333333';
const PEST = '44444444-4444-4444-8444-444444444444';

interface CapturedQuery {
  sql: string;
  params: Record<string, unknown>;
}

describe('SQL de pertenencia (TypeORM)', () => {
  let dataSource: DataSource;
  let queries: CapturedQuery[];
  let cropsService: CropsService;
  let pestsService: PestsService;

  const capture = (qb: SelectQueryBuilder<unknown>) =>
    queries.push({ sql: qb.getQuery(), params: qb.getParameters() });

  // Filtro por owner_id sobre la tabla farms unida en el JOIN.
  const ownerFilterOf = ({ sql, params }: CapturedQuery) => {
    const farmAlias = /LEFT JOIN "farms" "([^"]+)"/.exec(sql)?.[1];
    const param = new RegExp(`"${farmAlias}"\\."owner_id" = :(\\w+)`).exec(
      sql,
    )?.[1];
    return { farmAlias, ownerParam: param ? params[param] : undefined };
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      entities: [User, Farm, Crop, Pest],
    });
    // Construye la metadata de las entidades sin abrir conexión.
    await (
      dataSource as unknown as { buildMetadatas(): Promise<void> }
    ).buildMetadatas();
  });

  beforeEach(() => {
    queries = [];
    jest
      .spyOn(SelectQueryBuilder.prototype, 'getMany')
      .mockImplementation(function (this: SelectQueryBuilder<unknown>) {
        capture(this);
        return Promise.resolve([]);
      });
    jest
      .spyOn(SelectQueryBuilder.prototype, 'getOne')
      .mockImplementation(function (this: SelectQueryBuilder<unknown>) {
        capture(this);
        return Promise.resolve({ id: 'stub' });
      });

    const farmsService = new FarmsService(dataSource.getRepository(Farm));
    cropsService = new CropsService(
      dataSource.getRepository(Crop),
      farmsService,
    );
    pestsService = new PestsService(
      dataSource.getRepository(Pest),
      cropsService,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  describe('cultivos', () => {
    it('listar une con farms y filtra por owner_id', async () => {
      await cropsService.findAll(OWNER);
      expect(queries).toHaveLength(1);
      expect(queries[0].sql).toContain('FROM "crops"');
      expect(ownerFilterOf(queries[0]).ownerParam).toBe(OWNER);
    });

    it('listar por finca valida la finca y filtra por finca y owner_id', async () => {
      await cropsService.findAll(OWNER, FARM);
      expect(queries).toHaveLength(2);

      const [farmQuery, cropQuery] = queries;
      expect(farmQuery.sql).toContain('FROM "farms"');
      expect(farmQuery.sql).toMatch(/"owner_id" = :/);
      expect(Object.values(farmQuery.params)).toEqual(
        expect.arrayContaining([FARM, OWNER]),
      );

      expect(cropQuery.sql).toMatch(/"farm_id" = :/);
      expect(Object.values(cropQuery.params)).toContain(FARM);
      expect(ownerFilterOf(cropQuery).ownerParam).toBe(OWNER);
    });

    it('ver (y por tanto editar/borrar) filtra por id y owner_id', async () => {
      await cropsService.findOne(CROP, OWNER);
      expect(queries).toHaveLength(1);
      expect(queries[0].sql).toContain('FROM "crops"');
      expect(Object.values(queries[0].params)).toContain(CROP);
      expect(ownerFilterOf(queries[0]).ownerParam).toBe(OWNER);
    });
  });

  describe('plagas', () => {
    it('listar une pests → crops → farms y filtra por owner_id', async () => {
      await pestsService.findAll(OWNER);
      expect(queries).toHaveLength(1);
      expect(queries[0].sql).toContain('FROM "pests"');
      expect(queries[0].sql).toContain('LEFT JOIN "crops"');
      expect(ownerFilterOf(queries[0]).ownerParam).toBe(OWNER);
    });

    it('listar por cultivo valida el cultivo y filtra por cultivo y owner_id', async () => {
      await pestsService.findAll(OWNER, CROP);
      expect(queries).toHaveLength(2);

      const [cropQuery, pestQuery] = queries;
      expect(cropQuery.sql).toContain('FROM "crops"');
      expect(ownerFilterOf(cropQuery).ownerParam).toBe(OWNER);

      expect(pestQuery.sql).toMatch(/"crop_id" = :/);
      expect(Object.values(pestQuery.params)).toContain(CROP);
      expect(ownerFilterOf(pestQuery).ownerParam).toBe(OWNER);
    });

    it('ver (y por tanto editar/borrar) filtra por id y owner_id', async () => {
      await pestsService.findOne(PEST, OWNER);
      expect(queries).toHaveLength(1);
      expect(queries[0].sql).toContain('FROM "pests"');
      expect(Object.values(queries[0].params)).toContain(PEST);
      expect(ownerFilterOf(queries[0]).ownerParam).toBe(OWNER);
    });
  });
});
