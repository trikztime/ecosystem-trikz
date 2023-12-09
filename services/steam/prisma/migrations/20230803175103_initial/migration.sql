-- CreateTable
CREATE TABLE `avatars` (
    `auth3` INTEGER NOT NULL,
    `avatar_hash` VARCHAR(128) NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`auth3`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
