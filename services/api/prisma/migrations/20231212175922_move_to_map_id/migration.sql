/*
  Warnings:

  - You are about to drop the column `map` on the `log_playertimes` table. All the data in the column will be lost.
  - You are about to drop the column `map` on the `mapzones` table. All the data in the column will be lost.
  - You are about to drop the column `map` on the `playertimes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `index_[playertimes/[map/style/track/time]]` ON `playertimes`;

-- AlterTable
ALTER TABLE `log_playertimes` DROP COLUMN `map`,
    ALTER COLUMN `map_id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `mapzones` DROP COLUMN `map`,
    ALTER COLUMN `map_id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `playertimes` DROP COLUMN `map`,
    ALTER COLUMN `map_id` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `index_[playertimes/[style/track/time]]` ON `playertimes`(`style`, `track`, `time`);

-- AddForeignKey
ALTER TABLE `playertimes` ADD CONSTRAINT `fk_[playertimes/map_id]_[maplist/id]` FOREIGN KEY (`map_id`) REFERENCES `maplist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_playertimes` ADD CONSTRAINT `fk_[log_playertimes/map_id]_[maplist/id]` FOREIGN KEY (`map_id`) REFERENCES `maplist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mapzones` ADD CONSTRAINT `fk_[mapzones/map_id]_[maplist/id]` FOREIGN KEY (`map_id`) REFERENCES `maplist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
