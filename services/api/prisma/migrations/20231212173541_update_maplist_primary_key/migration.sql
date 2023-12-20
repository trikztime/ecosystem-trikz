/*
  Warnings:

  - The primary key for the `maplist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `map` on the `maplist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `maplist` DROP PRIMARY KEY,
    DROP COLUMN `map`,
    ALTER COLUMN `name` DROP DEFAULT,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
