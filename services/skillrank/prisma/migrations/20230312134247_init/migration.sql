-- CreateTable
CREATE TABLE `skillrank` (
    `auth` INTEGER NOT NULL,
    `map` VARCHAR(128) NOT NULL,
    `style` TINYINT NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `index_[skillrank/auth/map/style]`(`auth`, `map`, `style`),
    PRIMARY KEY (`auth`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
