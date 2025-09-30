import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1759191277553 implements MigrationInterface {
  name = 'Migration1759191277553';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`application\`
            ADD \`terminalStatusDate\` date NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`application\` DROP COLUMN \`terminalStatusDate\`
        `);
  }
}
