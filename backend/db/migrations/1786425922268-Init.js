/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Init1786425922268 {
    name = 'Init1786425922268'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "email" character varying(320) NOT NULL, "password" character varying(255) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coaches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "experience_years" integer NOT NULL DEFAULT '0', "description" text, "profile_image_url" character varying(2048), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "REL_bd9923ac72efde2d5895e118fa" UNIQUE ("user_id"), CONSTRAINT "PK_eddaece1a1f1b197fa39e6864a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coach_link_skill" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "coach_id" uuid NOT NULL, "skill_id" uuid NOT NULL, CONSTRAINT "PK_bc8d3b7b5252f4cfde063d08cd1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "coaches" ADD CONSTRAINT "FK_bd9923ac72efde2d5895e118fa8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coach_link_skill" ADD CONSTRAINT "FK_d4b119e6be1c3c93cff70c464f9" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coach_link_skill" ADD CONSTRAINT "FK_03c74fb9417eb9cc0305eea69ad" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "coach_link_skill" DROP CONSTRAINT "FK_03c74fb9417eb9cc0305eea69ad"`);
        await queryRunner.query(`ALTER TABLE "coach_link_skill" DROP CONSTRAINT "FK_d4b119e6be1c3c93cff70c464f9"`);
        await queryRunner.query(`ALTER TABLE "coaches" DROP CONSTRAINT "FK_bd9923ac72efde2d5895e118fa8"`);
        await queryRunner.query(`DROP TABLE "coach_link_skill"`);
        await queryRunner.query(`DROP TABLE "coaches"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
