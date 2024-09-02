export type TaskType = {
    id: string;
    userId: string;
    content: string;
    important: boolean;
    remind_me: Date | null;
    completed: boolean;
    duedate: Date | null;
}