import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1757434508983 implements MigrationInterface {
  name = 'Migration1757434508983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`FK_981cc89a6e49d019d81b4a98f6f\` ON \`user\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`athleticsSkills\` json NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_981cc89a6e49d019d81b4a98f6f\` FOREIGN KEY (\`companyRefId\`) REFERENCES \`company\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_981cc89a6e49d019d81b4a98f6f\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`athleticsSkills\`
        `);
    await queryRunner.query(`
            CREATE INDEX \`FK_981cc89a6e49d019d81b4a98f6f\` ON \`user\` (\`companyRefId\`)
        `);
  }
}
