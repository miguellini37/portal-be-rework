import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerToCompanyAndSchool1761697667876 implements MigrationInterface {
  name = 'AddOwnerToCompanyAndSchool1761697667876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`company\` ADD \`ownerId\` varchar(36) NULL`);
    await queryRunner.query(
      `ALTER TABLE \`company\` ADD UNIQUE INDEX \`IDX_ee87438803acb531639e8284be\` (\`ownerId\`)`
    );
    await queryRunner.query(`ALTER TABLE \`school\` ADD \`ownerId\` varchar(36) NULL`);
    await queryRunner.query(
      `ALTER TABLE \`school\` ADD UNIQUE INDEX \`IDX_cb3b185eba83efed664a5fdb04\` (\`ownerId\`)`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_ee87438803acb531639e8284be\` ON \`company\` (\`ownerId\`)`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_cb3b185eba83efed664a5fdb04\` ON \`school\` (\`ownerId\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`company\` ADD CONSTRAINT \`FK_ee87438803acb531639e8284be0\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`school\` ADD CONSTRAINT \`FK_cb3b185eba83efed664a5fdb04b\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`school\` DROP FOREIGN KEY \`FK_cb3b185eba83efed664a5fdb04b\``
    );
    await queryRunner.query(
      `ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_ee87438803acb531639e8284be0\``
    );
    await queryRunner.query(`DROP INDEX \`REL_cb3b185eba83efed664a5fdb04\` ON \`school\``);
    await queryRunner.query(`DROP INDEX \`REL_ee87438803acb531639e8284be\` ON \`company\``);
    await queryRunner.query(`ALTER TABLE \`school\` DROP INDEX \`IDX_cb3b185eba83efed664a5fdb04\``);
    await queryRunner.query(`ALTER TABLE \`school\` DROP COLUMN \`ownerId\``);
    await queryRunner.query(
      `ALTER TABLE \`company\` DROP INDEX \`IDX_ee87438803acb531639e8284be\``
    );
    await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`ownerId\``);
  }
}
