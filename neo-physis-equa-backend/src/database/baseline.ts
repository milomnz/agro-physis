import dataSource from './data-source';

const INITIAL_MIGRATION = {
  timestamp: 1793048286926,
  name: 'InitialSchema1793048286926',
};

const EXPECTED_TABLES = ['users', 'farms', 'crops', 'pests'];

async function main(): Promise<void> {
  await dataSource.initialize();

  try {
    const tables: Array<{ table_name: string }> = await dataSource.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    );
    const present = new Set(tables.map((table) => table.table_name));
    const missing = EXPECTED_TABLES.filter((table) => !present.has(table));

    if (missing.length > 0) {
      console.error(
        `No se puede marcar la línea base: faltan tablas (${missing.join(', ')}).`,
      );
      console.error(
        'Si la base está vacía, ejecuta primero: npm run migration:run',
      );
      process.exitCode = 1;
      return;
    }

    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "migrations" (
        "id" SERIAL NOT NULL,
        "timestamp" bigint NOT NULL,
        "name" character varying NOT NULL,
        CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
      )
    `);

    const existing: unknown[] = await dataSource.query(
      `SELECT 1 FROM "migrations" WHERE "name" = $1`,
      [INITIAL_MIGRATION.name],
    );

    if (existing.length > 0) {
      console.log(
        `La migración ${INITIAL_MIGRATION.name} ya estaba registrada. Nada que hacer.`,
      );
      return;
    }

    await dataSource.query(
      `INSERT INTO "migrations" ("timestamp", "name") VALUES ($1, $2)`,
      [INITIAL_MIGRATION.timestamp, INITIAL_MIGRATION.name],
    );

    console.log(`Migración ${INITIAL_MIGRATION.name} marcada como aplicada.`);
    console.log(
      'Verifica con: npm run migration:generate -- src/database/migrations/Check',
    );
    console.log('Debe responder: No changes in database schema were found');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: Error) => {
  console.error('Error al marcar la línea base:', error.message ?? error);
  process.exitCode = 1;
});
