-- CreateTable
CREATE TABLE `users` (
    `auth` INTEGER NOT NULL,
    `name` VARCHAR(128) NULL,
    `ip` INTEGER NULL,
    `lastlogin` INTEGER NOT NULL DEFAULT -1,
    `points` FLOAT NOT NULL DEFAULT 0,

    INDEX `index_[user/lastlogin]`(`lastlogin`),
    INDEX `index_[user/points]`(`points`),
    PRIMARY KEY (`auth`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `playertimes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auth` INTEGER NULL,
    `auth2` INTEGER NULL DEFAULT 0,
    `map` VARCHAR(128) NULL,
    `time` DOUBLE NULL,
    `jumps` INTEGER NULL,
    `style` TINYINT NULL,
    `date` INTEGER NULL,
    `points` FLOAT NOT NULL DEFAULT 0,
    `track` TINYINT NOT NULL DEFAULT 0,
    `completions` SMALLINT NULL DEFAULT 0,

    INDEX `index_[playertimes/[auth/auth2/date/points]]`(`auth`, `date`, `points`),
    INDEX `index_[playertimes/[map/style/track/time]]`(`map`, `style`, `track`, `time`),
    INDEX `time`(`time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `log_playertimes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auth` INTEGER NULL,
    `auth2` INTEGER NULL DEFAULT 0,
    `map` VARCHAR(128) NULL,
    `track` TINYINT NULL,
    `style` TINYINT NULL,
    `date` INTEGER NULL,
    `jumps` INTEGER NULL,
    `time` DOUBLE NULL,

    INDEX `index_[log_playertimes/date]`(`date`),
    INDEX `index_[log_playertimes/auth]`(`auth`),
    INDEX `index_[log_playertimes/auth2]`(`auth2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `experience` (
    `auth` INTEGER NOT NULL DEFAULT 0,
    `exp` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`auth`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `maplist` (
    `map` VARCHAR(128) NOT NULL,
    `exp_points` INTEGER NOT NULL DEFAULT 0,
    `tier` TINYINT NOT NULL DEFAULT 0,
    `base_points` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`map`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `mapzones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `map` VARCHAR(128) NULL,
    `type` INTEGER NULL,
    `corner1_x` FLOAT NULL,
    `corner1_y` FLOAT NULL,
    `corner1_z` FLOAT NULL,
    `corner2_x` FLOAT NULL,
    `corner2_y` FLOAT NULL,
    `corner2_z` FLOAT NULL,
    `destination_x` FLOAT NOT NULL DEFAULT 0,
    `destination_y` FLOAT NOT NULL DEFAULT 0,
    `destination_z` FLOAT NOT NULL DEFAULT 0,
    `track` INTEGER NOT NULL DEFAULT 0,
    `flags` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- AddForeignKey
ALTER TABLE `playertimes` ADD CONSTRAINT `fk_[playertimes/auth]_[users/auth]` FOREIGN KEY (`auth`) REFERENCES `users`(`auth`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `playertimes` ADD CONSTRAINT `fk_[playertimes/auth2]_[users/auth]` FOREIGN KEY (`auth2`) REFERENCES `users`(`auth`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_playertimes` ADD CONSTRAINT `fk_[log_playertimes/auth]_[users/auth]` FOREIGN KEY (`auth`) REFERENCES `users`(`auth`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_playertimes` ADD CONSTRAINT `fk_[log_playertimes/auth2]_[users/auth]` FOREIGN KEY (`auth2`) REFERENCES `users`(`auth`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experience` ADD CONSTRAINT `fk_[experience/auth]_[users/auth]` FOREIGN KEY (`auth`) REFERENCES `users`(`auth`) ON DELETE CASCADE ON UPDATE CASCADE;
