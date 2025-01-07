import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1736244177694 implements MigrationInterface {
  name = 'CreateTable1736244177694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resource" DROP CONSTRAINT "FK_d101cd572a7de19b18812084725"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "PK_920331560282b8bd21bb02290df"`,
    );
    await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "resource" DROP CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f"`,
    );
    await queryRunner.query(`ALTER TABLE "resource" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "resource" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "resource" ADD CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "resource" DROP COLUMN "idId"`);
    await queryRunner.query(`ALTER TABLE "resource" ADD "idId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "PK_19a94c31d4960ded0dcd0397759"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "PK_3d0a7155eafd75ddba5a7013368" PRIMARY KEY ("role_id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e3a3ba47b7ca00fd23be4ebd6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "permission_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "PK_3d0a7155eafd75ddba5a7013368"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "PK_19a94c31d4960ded0dcd0397759" PRIMARY KEY ("role_id", "permission_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3a3ba47b7ca00fd23be4ebd6c" ON "role_permission" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "resource" ADD CONSTRAINT "FK_d101cd572a7de19b18812084725" FOREIGN KEY ("idId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resource" DROP CONSTRAINT "FK_d101cd572a7de19b18812084725"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e3a3ba47b7ca00fd23be4ebd6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "PK_19a94c31d4960ded0dcd0397759"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "PK_3d0a7155eafd75ddba5a7013368" PRIMARY KEY ("role_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD "permission_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3a3ba47b7ca00fd23be4ebd6c" ON "role_permission" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "PK_3d0a7155eafd75ddba5a7013368"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "PK_19a94c31d4960ded0dcd0397759" PRIMARY KEY ("role_id", "permission_id")`,
    );
    await queryRunner.query(`ALTER TABLE "resource" DROP COLUMN "idId"`);
    await queryRunner.query(`ALTER TABLE "resource" ADD "idId" integer`);
    await queryRunner.query(
      `ALTER TABLE "resource" DROP CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f"`,
    );
    await queryRunner.query(`ALTER TABLE "resource" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "resource" ADD "id" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "resource" ADD CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "PK_920331560282b8bd21bb02290df"`,
    );
    await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ADD CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "resource" ADD CONSTRAINT "FK_d101cd572a7de19b18812084725" FOREIGN KEY ("idId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
