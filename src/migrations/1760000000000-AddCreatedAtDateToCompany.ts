import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtDateToCompany1760000000000 implements MigrationInterface {
  name = 'AddCreatedAtDateToCompany1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`company\` 
      ADD \`createdAtDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`company\` 
      DROP COLUMN \`createdAtDate\`
    `);
  }
}
