import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOwnerUnique1773100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Company: drop unique FK, replace with non-unique index + FK
    await queryRunner.query('ALTER TABLE company DROP FOREIGN KEY `FK_ee87438803acb531639e8284be0`');
    await queryRunner.query('ALTER TABLE company DROP INDEX `REL_ee87438803acb531639e8284be`');
    await queryRunner.query('ALTER TABLE company ADD INDEX `IDX_company_ownerId` (`ownerId`)');
    await queryRunner.query(
      'ALTER TABLE company ADD CONSTRAINT `FK_company_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE SET NULL'
    );

    // School: drop unique FK, replace with non-unique index + FK
    await queryRunner.query('ALTER TABLE school DROP FOREIGN KEY `FK_cb3b185eba83efed664a5fdb04b`');
    await queryRunner.query('ALTER TABLE school DROP INDEX `REL_cb3b185eba83efed664a5fdb04`');
    await queryRunner.query('ALTER TABLE school ADD INDEX `IDX_school_ownerId` (`ownerId`)');
    await queryRunner.query(
      'ALTER TABLE school ADD CONSTRAINT `FK_school_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE SET NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Company: restore unique constraint
    await queryRunner.query('ALTER TABLE company DROP FOREIGN KEY `FK_company_ownerId`');
    await queryRunner.query('ALTER TABLE company DROP INDEX `IDX_company_ownerId`');
    await queryRunner.query('ALTER TABLE company ADD UNIQUE INDEX `REL_ee87438803acb531639e8284be` (`ownerId`)');
    await queryRunner.query(
      'ALTER TABLE company ADD CONSTRAINT `FK_ee87438803acb531639e8284be0` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE SET NULL'
    );

    // School: restore unique constraint
    await queryRunner.query('ALTER TABLE school DROP FOREIGN KEY `FK_school_ownerId`');
    await queryRunner.query('ALTER TABLE school DROP INDEX `IDX_school_ownerId`');
    await queryRunner.query('ALTER TABLE school ADD UNIQUE INDEX `REL_cb3b185eba83efed664a5fdb04` (`ownerId`)');
    await queryRunner.query(
      'ALTER TABLE school ADD CONSTRAINT `FK_cb3b185eba83efed664a5fdb04b` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE SET NULL'
    );
  }
}
