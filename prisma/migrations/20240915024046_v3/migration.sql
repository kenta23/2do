-- AddForeignKey
ALTER TABLE "PendingTask" ADD CONSTRAINT "PendingTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CollabTasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
