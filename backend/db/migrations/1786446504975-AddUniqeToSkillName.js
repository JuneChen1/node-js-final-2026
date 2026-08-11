/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddUniqeToSkillName1786446504975 {
    name = 'AddUniqeToSkillName1786446504975'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "skills" ADD CONSTRAINT "UQ_81f05095507fd84aa2769b4a522" UNIQUE ("name")`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT "UQ_81f05095507fd84aa2769b4a522"`);
    }
}
