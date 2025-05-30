import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndAlumni1747697774061 implements MigrationInterface {
  name = 'CreateUserAndAlumni1747697774061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`permission\` varchar(255) NOT NULL DEFAULT 'user',
                \`firstName\` varchar(255) NULL,
                \`lastName\` varchar(255) NULL,
                \`sport\` varchar(255) NULL,
                \`position\` varchar(255) NULL,
                \`school\` varchar(255) NULL,
                \`major\` varchar(255) NULL,
                \`gpa\` float NULL,
                \`division\` varchar(255) NULL,
                \`accolades\` text NULL,
                \`teamRole\` varchar(255) NULL,
                \`coachability\` varchar(255) NULL,
                \`industry\` varchar(255) NULL,
                \`relocation\` tinyint NULL,
                \`graduationDate\` date NULL,
                \`points\` int NULL,
                \`assists\` int NULL,
                \`jobTitle\` varchar(255) NULL,
                \`company\` varchar(255) NULL,
                \`jobLocation\` varchar(255) NULL,
                \`jobDescriptio\` text NULL,
                \`type\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
                INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` (\`type\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
