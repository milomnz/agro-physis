import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1793048286926 implements MigrationInterface {
    name = 'InitialSchema1793048286926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role" AS ENUM('productor', 'colaborador', 'admin')`);
        await queryRunner.query(`CREATE TYPE "public"."disability_type" AS ENUM('motora', 'visual', 'auditiva', 'intelectual', 'ninguna')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "role" "public"."user_role" NOT NULL DEFAULT 'productor', "accessibility_profile" jsonb NOT NULL DEFAULT '{}', "disability_type" "public"."disability_type", "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "farms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "location" jsonb NOT NULL DEFAULT '{}', "altitude" double precision NOT NULL, "owner_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_39aff9c35006b14025bba5a43d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pests_severity_enum" AS ENUM('baja', 'media', 'alta')`);
        await queryRunner.query(`CREATE TABLE "pests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "crop_id" uuid NOT NULL, "commonName" character varying(255) NOT NULL, "scientificName" character varying(255), "affectedCrops" jsonb NOT NULL DEFAULT '[]', "symptoms" jsonb NOT NULL DEFAULT '[]', "severity" "public"."pests_severity_enum" NOT NULL DEFAULT 'media', "imageReferences" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5201b50db560d29afc2aef1e517" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."crops_growthstage_enum" AS ENUM('vegetativo', 'floración', 'fructificación', 'producción')`);
        await queryRunner.query(`CREATE TABLE "crops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "farm_id" uuid NOT NULL, "species" character varying(255) NOT NULL, "plantedDate" TIMESTAMP WITH TIME ZONE, "growthStage" "public"."crops_growthstage_enum" NOT NULL DEFAULT 'vegetativo', "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_098dbeb7c803dc7c08a7f02b805" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "farms" ADD CONSTRAINT "FK_204aed99900ed35c8db32c60db7" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pests" ADD CONSTRAINT "FK_5459bc7f851c2cde63b8fff651e" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "crops" ADD CONSTRAINT "FK_b02d00d3b2e915d81078ae10dfc" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crops" DROP CONSTRAINT "FK_b02d00d3b2e915d81078ae10dfc"`);
        await queryRunner.query(`ALTER TABLE "pests" DROP CONSTRAINT "FK_5459bc7f851c2cde63b8fff651e"`);
        await queryRunner.query(`ALTER TABLE "farms" DROP CONSTRAINT "FK_204aed99900ed35c8db32c60db7"`);
        await queryRunner.query(`DROP TABLE "crops"`);
        await queryRunner.query(`DROP TYPE "public"."crops_growthstage_enum"`);
        await queryRunner.query(`DROP TABLE "pests"`);
        await queryRunner.query(`DROP TYPE "public"."pests_severity_enum"`);
        await queryRunner.query(`DROP TABLE "farms"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."disability_type"`);
        await queryRunner.query(`DROP TYPE "public"."user_role"`);
    }

}
