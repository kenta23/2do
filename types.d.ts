export type TaskType = {
  id: string;
  userId: string;
  content: string;
  important: boolean;
  remind_me: Date | null;
  completed: boolean;
  duedate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CollabTasksType = {
  id: string;
  content: string;
  important: boolean;
  remind_me: Date | null;
  completed: boolean;
  joinedUsers: string[];
  duedate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type singleList = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: TaskType[];
  collabTasks?: CollabTasksType[];
  user?: User;
};

export type PendingTaskType = {
  id: string;
  userId: string;
  taskId: string;
  viewed: boolean;
  createdAt: Date;
  status: CollabStatus;
  owner?: AuthUser;
  collabTasks: CollabTasks;
  createdAt: Date | string;
  updatedAt: Date | string;
};

// export type User = {
//   id: string;
//   aud: string;
//   role: string;
//   email: string;
//   email_confirmed_at: string | null;
//   phone: string;
//   confirmed_at: string | null;
//   recovery_sent_at: string | null;
//   last_sign_in_at: string | null;
//   app_metadata: {
//     provider: string;
//     providers: string[];
//   };
//   user_metadata: {
//     avatar_url: string | null;
//     email: string | null;
//     email_verified: boolean | null;
//     full_name: string | null;
//     iss: string | null;
//     name: string | null;
//     phone_verified: boolean | null;
//     preferred_username: string | null;
//     provider_id: string | null;
//     sub: string | null;
//     user_name: string | null;
//   };
//   identities: {
//     identity_id: string;
//     id: string;
//     user_id: string;
//     identity_data: Record<string, unknown>[];
//     provider: string;
//     last_sign_in_at: string | null;
//     created_at: string;
//     updated_at: string;
//     email: string | null;
//   }[];
//   created_at: string;
//   updated_at: string;
//   is_anonymous: boolean;
// };

export interface AuthUser {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: string | null;
    image: string;
  };
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
}

export type TaskOrCollabTask = TaskType | CollabTasksType;
