-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "remind_me" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "duedate" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);
