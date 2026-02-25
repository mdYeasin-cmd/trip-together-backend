/*
  Warnings:

  - Added the required column `type` to the `travel_buddy_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TravelBuddyRequestType" AS ENUM ('REQUEST', 'INVITE');

-- AlterTable
ALTER TABLE "travel_buddy_requests" ADD COLUMN     "invitedById" TEXT,
ADD COLUMN     "type" "TravelBuddyRequestType" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "travel_buddy_requests" ADD CONSTRAINT "travel_buddy_requests_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
