/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddCourseBookingAndCreditPurchaseTable1787055167151 {
    name = 'AddCourseBookingAndCreditPurchaseTable1787055167151'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "course_bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cancelled_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "course_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_d8f8109ef28a5fb4bbda2e5d562" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "credit_purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchased_credits" integer NOT NULL, "price_paid" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "credit_package_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_89d96f2901d625d5879c1bc6f47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "course_bookings" ADD CONSTRAINT "FK_0fa3cabc0a327c50557f304c181" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_bookings" ADD CONSTRAINT "FK_db356d30e68c23856ea0a6cd79d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_purchases" ADD CONSTRAINT "FK_903582a75a65e42a45ee791d84f" FOREIGN KEY ("credit_package_id") REFERENCES "credit_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_purchases" ADD CONSTRAINT "FK_e4b42966827f8e07f9880e78310" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "credit_purchases" DROP CONSTRAINT "FK_e4b42966827f8e07f9880e78310"`);
        await queryRunner.query(`ALTER TABLE "credit_purchases" DROP CONSTRAINT "FK_903582a75a65e42a45ee791d84f"`);
        await queryRunner.query(`ALTER TABLE "course_bookings" DROP CONSTRAINT "FK_db356d30e68c23856ea0a6cd79d"`);
        await queryRunner.query(`ALTER TABLE "course_bookings" DROP CONSTRAINT "FK_0fa3cabc0a327c50557f304c181"`);
        await queryRunner.query(`DROP TABLE "credit_purchases"`);
        await queryRunner.query(`DROP TABLE "course_bookings"`);
    }
}
