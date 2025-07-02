import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1751415573535 implements MigrationInterface {
    name = 'Migration1751415573535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NULL,
                \`password\` varchar(255) NULL,
                \`permission\` varchar(255) NULL DEFAULT 'user',
                \`firstName\` varchar(255) NULL,
                \`lastName\` varchar(255) NULL,
                \`position\` varchar(255) NULL,
                \`schoolName\` varchar(255) NULL,
                \`sport\` varchar(255) NULL,
                \`companyName\` varchar(255) NULL,
                \`major\` varchar(255) NULL,
                \`gpa\` float NULL,
                \`division\` varchar(255) NULL,
                \`accolades\` varchar(255) NULL,
                \`teamRole\` varchar(255) NULL,
                \`graduationDate\` date NULL,
                \`statistics\` varchar(255) NULL,
                \`internshipIds\` text NULL,
                \`type\` varchar(255) NOT NULL,
                \`schoolRefId\` varchar(36) NULL,
                \`companyRefId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
                INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` (\`type\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`company\` (
                \`id\` varchar(36) NOT NULL,
                \`companyName\` varchar(255) NULL,
                \`industry\` varchar(255) NULL,
                \`ownerRefId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_a7018eb2ac7b827608ba6856ca\` (\`companyName\`),
                UNIQUE INDEX \`REL_859dc203a23d97e7a8a7c1c7c4\` (\`ownerRefId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`school\` (
                \`id\` varchar(36) NOT NULL,
                \`schoolName\` varchar(255) NULL,
                \`ownerRefId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_9eb00e0accde5ee2d96e86570b\` (\`schoolName\`),
                UNIQUE INDEX \`REL_21fa1878f7ae3fd4d8d4029772\` (\`ownerRefId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`post\` (
                \`id\` varchar(36) NOT NULL,
                \`content\` varchar(255) NULL,
                \`date\` date NULL,
                \`type\` varchar(255) NULL,
                \`authorId\` varchar(36) NULL,
                \`schoolId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`comment\` (
                \`id\` varchar(36) NOT NULL,
                \`content\` varchar(255) NULL,
                \`postId\` varchar(36) NULL,
                \`authorId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`job\` (
                \`id\` varchar(36) NOT NULL,
                \`position\` varchar(255) NULL,
                \`location\` varchar(255) NULL,
                \`salary\` varchar(255) NULL,
                \`benefit\` varchar(255) NULL,
                \`description\` varchar(255) NULL,
                \`requirements\` varchar(255) NULL,
                \`type\` varchar(255) NULL,
                \`companyId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`message\` (
                \`id\` varchar(36) NOT NULL,
                \`message\` varchar(255) NULL,
                \`createdDate\` timestamp NULL,
                \`fromUserId\` varchar(36) NULL,
                \`toUserId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`school_event\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) NULL,
                \`type\` varchar(255) NULL,
                \`description\` varchar(255) NULL,
                \`date\` date NULL,
                \`location\` varchar(255) NULL,
                \`schoolId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user_schools_school\` (
                \`userId\` varchar(36) NOT NULL,
                \`schoolId\` varchar(36) NOT NULL,
                INDEX \`IDX_1cc10b90627a96d082407900ec\` (\`userId\`),
                INDEX \`IDX_672308255926164cca4f904795\` (\`schoolId\`),
                PRIMARY KEY (\`userId\`, \`schoolId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_02119985094dfe844ef334aacc8\` FOREIGN KEY (\`schoolRefId\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_981cc89a6e49d019d81b4a98f6f\` FOREIGN KEY (\`companyRefId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD CONSTRAINT \`FK_859dc203a23d97e7a8a7c1c7c44\` FOREIGN KEY (\`ownerRefId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`school\`
            ADD CONSTRAINT \`FK_21fa1878f7ae3fd4d8d40297720\` FOREIGN KEY (\`ownerRefId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`post\`
            ADD CONSTRAINT \`FK_c6fb082a3114f35d0cc27c518e0\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`post\`
            ADD CONSTRAINT \`FK_2a39546ac8af066d45aa251c863\` FOREIGN KEY (\`schoolId\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_94a85bb16d24033a2afdd5df060\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_276779da446413a0d79598d4fbd\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD CONSTRAINT \`FK_e66170573cabd565dab1132727d\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_c59262513a3006fd8f58bb4b7c2\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_96789153e31e0bb7885ea13a279\` FOREIGN KEY (\`toUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`school_event\`
            ADD CONSTRAINT \`FK_769fd7a0f041de4be5bde29c300\` FOREIGN KEY (\`schoolId\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_schools_school\`
            ADD CONSTRAINT \`FK_1cc10b90627a96d082407900ec8\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_schools_school\`
            ADD CONSTRAINT \`FK_672308255926164cca4f904795c\` FOREIGN KEY (\`schoolId\`) REFERENCES \`school\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user_schools_school\` DROP FOREIGN KEY \`FK_672308255926164cca4f904795c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_schools_school\` DROP FOREIGN KEY \`FK_1cc10b90627a96d082407900ec8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`school_event\` DROP FOREIGN KEY \`FK_769fd7a0f041de4be5bde29c300\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_96789153e31e0bb7885ea13a279\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_c59262513a3006fd8f58bb4b7c2\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e66170573cabd565dab1132727d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_276779da446413a0d79598d4fbd\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_94a85bb16d24033a2afdd5df060\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_2a39546ac8af066d45aa251c863\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_c6fb082a3114f35d0cc27c518e0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`school\` DROP FOREIGN KEY \`FK_21fa1878f7ae3fd4d8d40297720\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_859dc203a23d97e7a8a7c1c7c44\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_981cc89a6e49d019d81b4a98f6f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_02119985094dfe844ef334aacc8\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_672308255926164cca4f904795\` ON \`user_schools_school\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_1cc10b90627a96d082407900ec\` ON \`user_schools_school\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user_schools_school\`
        `);
        await queryRunner.query(`
            DROP TABLE \`school_event\`
        `);
        await queryRunner.query(`
            DROP TABLE \`message\`
        `);
        await queryRunner.query(`
            DROP TABLE \`job\`
        `);
        await queryRunner.query(`
            DROP TABLE \`comment\`
        `);
        await queryRunner.query(`
            DROP TABLE \`post\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_21fa1878f7ae3fd4d8d4029772\` ON \`school\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_9eb00e0accde5ee2d96e86570b\` ON \`school\`
        `);
        await queryRunner.query(`
            DROP TABLE \`school\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_859dc203a23d97e7a8a7c1c7c4\` ON \`company\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a7018eb2ac7b827608ba6856ca\` ON \`company\`
        `);
        await queryRunner.query(`
            DROP TABLE \`company\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user\`
        `);
    }

}
