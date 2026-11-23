import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPushToken1795122000000 implements MigrationInterface {
  name = 'AddUserPushToken1795122000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "push_token" character varying(255) DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "push_token"`);
  }
}
