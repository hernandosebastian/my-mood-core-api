import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserAvatarNullable1741036071412
  implements MigrationInterface
{
  name = 'UpdateUserAvatarNullable1741036071412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "avatarSrc" DROP NOT NULL`,
    );
    await queryRunner.query(`UPDATE "user" SET "avatarSrc" = NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "user" SET "avatarSrc" = ''`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "avatarSrc" SET NOT NULL`,
    );
  }
}
