-- Создание нового индекса на столбец auth
ALTER TABLE `playertimes` ADD INDEX `fk_[playertimes/auth]_[users/auth]` (`auth`);

-- Удаление старого индекса
ALTER TABLE `playertimes` DROP INDEX `index_[playertimes/[auth/auth2/date/points]]`;
