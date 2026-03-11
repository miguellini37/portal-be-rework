import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1772600000000 implements MigrationInterface {
  name = 'Migration1772600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Shared field for both SchoolEmployee and CompanyEmployee
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`linkedIn\` varchar(255) NULL
        `);

    // SchoolEmployee fields
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`department\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`officeLocation\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`officeHours\` varchar(255) NULL
        `);

    // CompanyEmployee fields
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`roleType\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`isFormerAthlete\` tinyint NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`athleteSport\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`athletePosition\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`athleteUniversity\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`athleteGraduationYear\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`athleteAchievements\` text NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`athleteAchievements\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`athleteGraduationYear\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`athleteUniversity\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`athletePosition\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`athleteSport\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`isFormerAthlete\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`roleType\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`officeHours\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`officeLocation\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`department\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`linkedIn\`
        `);
  }
}
