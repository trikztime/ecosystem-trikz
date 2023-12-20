/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `maplist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `maplist_name_key` ON `maplist`(`name`);
