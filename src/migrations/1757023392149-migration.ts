import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1757023392149 implements MigrationInterface {
  name = 'Migration1757023392149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`status\` varchar(255) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`status\`
        `);
  }
}
