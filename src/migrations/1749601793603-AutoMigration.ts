import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1749601793603 implements MigrationInterface {
    name = 'AutoMigration1749601793603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NULL, \`password\` varchar(255) NULL, \`permission\` varchar(255) NULL DEFAULT 'user', \`schoolName\` varchar(255) NULL, \`companyName\` varchar(255) NULL, \`industry\` varchar(255) NULL, \`firstName\` varchar(255) NULL, \`lastName\` varchar(255) NULL, \`sport\` varchar(255) NULL, \`position\` varchar(255) NULL, \`school\` varchar(255) NULL, \`major\` varchar(255) NULL, \`gpa\` float NULL, \`division\` varchar(255) NULL, \`accolades\` varchar(255) NULL, \`teamRole\` varchar(255) NULL, \`coachability\` varchar(255) NULL, \`graduationDate\` date NULL, \`points\` int NULL, \`assists\` int NULL, \`jobTitle\` varchar(255) NULL, \`company\` varchar(255) NULL, \`location\` varchar(255) NULL, \`description\` varchar(255) NULL, \`internshipIds\` text NULL, \`type\` varchar(255) NOT NULL, \`schoolRefId\` int NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` (\`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`school_event\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NULL, \`type\` varchar(255) NULL, \`description\` varchar(255) NULL, \`date\` date NULL, \`location\` varchar(255) NULL, \`schoolId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`post\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(255) NULL, \`date\` date NULL, \`type\` varchar(255) NULL, \`authorId\` int NULL, \`schoolId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`job\` (\`id\` int NOT NULL AUTO_INCREMENT, \`position\` varchar(255) NULL, \`location\` varchar(255) NULL, \`salary\` varchar(255) NULL, \`benefit\` varchar(255) NULL, \`description\` varchar(255) NULL, \`requirements\` varchar(255) NULL, \`type\` varchar(255) NULL, \`companyId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`message\` (\`id\` int NOT NULL AUTO_INCREMENT, \`message\` varchar(255) NULL, \`createdDate\` timestamp NULL, \`fromUserId\` int NULL, \`toUserId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(255) NULL, \`postId\` int NULL, \`authorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_02119985094dfe844ef334aacc8\` FOREIGN KEY (\`schoolRefId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`school_event\` ADD CONSTRAINT \`FK_769fd7a0f041de4be5bde29c300\` FOREIGN KEY (\`schoolId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`post\` ADD CONSTRAINT \`FK_c6fb082a3114f35d0cc27c518e0\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`post\` ADD CONSTRAINT \`FK_2a39546ac8af066d45aa251c863\` FOREIGN KEY (\`schoolId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`job\` ADD CONSTRAINT \`FK_e66170573cabd565dab1132727d\` FOREIGN KEY (\`companyId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_c59262513a3006fd8f58bb4b7c2\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_96789153e31e0bb7885ea13a279\` FOREIGN KEY (\`toUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_94a85bb16d24033a2afdd5df060\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_276779da446413a0d79598d4fbd\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_276779da446413a0d79598d4fbd\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_94a85bb16d24033a2afdd5df060\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_96789153e31e0bb7885ea13a279\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_c59262513a3006fd8f58bb4b7c2\``);
        await queryRunner.query(`ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e66170573cabd565dab1132727d\``);
        await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_2a39546ac8af066d45aa251c863\``);
        await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_c6fb082a3114f35d0cc27c518e0\``);
        await queryRunner.query(`ALTER TABLE \`school_event\` DROP FOREIGN KEY \`FK_769fd7a0f041de4be5bde29c300\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_02119985094dfe844ef334aacc8\``);
        await queryRunner.query(`DROP TABLE \`comment\``);
        await queryRunner.query(`DROP TABLE \`message\``);
        await queryRunner.query(`DROP TABLE \`job\``);
        await queryRunner.query(`DROP TABLE \`post\``);
        await queryRunner.query(`DROP TABLE \`school_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
