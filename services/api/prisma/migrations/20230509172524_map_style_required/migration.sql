/*
  Warnings:

  - Made the column `map` on table `playertimes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `style` on table `playertimes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `playertimes` MODIFY `map` VARCHAR(128) NOT NULL,
    MODIFY `style` TINYINT NOT NULL;
