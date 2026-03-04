import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1772503249625 implements MigrationInterface {
  name = 'Migration1772503249625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`orgDomain\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD UNIQUE INDEX \`IDX_96b1e525f51562fc9011f0c80e\` (\`orgDomain\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP INDEX \`IDX_96b1e525f51562fc9011f0c80e\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`orgDomain\`
        `);
  }
}
