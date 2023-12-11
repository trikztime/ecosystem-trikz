-- AlterTable
ALTER TABLE `log_playertimes` ADD COLUMN `map_id` INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE `mapzones` ADD COLUMN `map_id` INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE `playertimes` ADD COLUMN `map_id` INTEGER NOT NULL DEFAULT -1;
