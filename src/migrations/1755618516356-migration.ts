import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755618516356 implements MigrationInterface {
    name = 'Migration1755618516356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsBasesalary\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsCommission\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsTotalcomp\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsSpecficbenefits\` json NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsSpecficbenefits\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsTotalcomp\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsCommission\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsBasesalary\`
        `);
    }

}
