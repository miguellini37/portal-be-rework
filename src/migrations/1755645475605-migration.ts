import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1755645475605 implements MigrationInterface {
  name = 'Migration1755645475605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`job\` CHANGE \`payment\` \`salary\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`salary\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`salary\` int NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`salary\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`salary\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\` CHANGE \`salary\` \`payment\` varchar(255) NULL
        `);
  }
}
