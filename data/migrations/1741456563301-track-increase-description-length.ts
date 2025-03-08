import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrackIncreaseDescriptionLength1741456563301
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`track\` MODIFY COLUMN \`description\` varchar(1000) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`track\` MODIFY COLUMN \`description\` varchar(255) NULL`,
    );
  }
}
