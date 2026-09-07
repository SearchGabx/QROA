-- DropForeignKey
ALTER TABLE "scans" DROP CONSTRAINT "scans_meetingId_fkey";

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
