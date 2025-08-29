import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1755219661837 implements MigrationInterface {
  name = 'Migration1755219661837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`cultureCulturevalues\` json NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`cultureEnvironmenttiles\` json NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`cultureThrivepoints\` json NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`cultureThrivepoints\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`cultureEnvironmenttiles\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`cultureCulturevalues\`
        `);
  }
}
