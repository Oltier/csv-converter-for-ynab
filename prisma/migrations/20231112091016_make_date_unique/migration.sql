/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `CurrencyRateUsd` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRateUsd_date_key" ON "CurrencyRateUsd"("date");
