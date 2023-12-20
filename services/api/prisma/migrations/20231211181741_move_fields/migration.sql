-- Move fields
ALTER TABLE `maplist` CHANGE `name` `name` VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' FIRST;
ALTER TABLE `maplist` CHANGE `id` `id` INT(11) NOT NULL DEFAULT 0 FIRST;

ALTER TABLE `mapzones` CHANGE `map_id` `map_id` INT(11) NOT NULL DEFAULT -1 AFTER `id`;

ALTER TABLE `playertimes` CHANGE `map_id` `map_id` INT(11) NOT NULL DEFAULT -1 AFTER `id`;

ALTER TABLE `log_playertimes` CHANGE `map_id` `map_id` INT(11) NOT NULL DEFAULT -1 AFTER `id`;
