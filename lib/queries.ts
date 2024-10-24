import {
  deleteSingleTask,
  fetchAssignedTasks,
  fetchYourTasksTodos,
  getSingleTask,
  getTask,
  suggestedUsers,
} from "@/app/actions/data";
import { markAsImportant } from "@/app/actions/important";
import { checkIsInListQuery, getLists, IsInList } from "@/app/actions/lists";
import { TaskOrCollabTask, TaskType } from "@/types";
import {
  QueryClient,
  UseMutateFunction,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useTaskListQuery(open: boolean, taskId: string) {
  return useQuery({
    queryKey: ["tasklists"],
    queryFn: async () => await checkIsInListQuery(taskId),
    enabled: open,
  });
}

//can be used on collab tasks or tasks
export function useTasksQuery(querykey: string, pathname: string) {
  return useQuery({
    queryKey: [querykey],
    queryFn: async () => await getTask(pathname),
  });
}

export function useOptimisiticAddNewTask() {
  return useMutationState({
    filters: { mutationKey: ["addNewTodo"], status: "pending" },
    select: (mutation) => mutation.state.variables as TaskOrCollabTask,
  });
}

//delete mutation

export function useDeleteMutation(
  querykey: string,
  queryClient: QueryClient,
  pathname: string
) {
  return useMutation({
    mutationFn: async (id: string) => await deleteSingleTask(id, pathname),
    mutationKey: ["deleteTask"],
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: [querykey] }); //cancel incoming query

      //snapshot prev items
      const prevTodos = queryClient.getQueryData([querykey]); //get the cache query

      //optimistic updates
      //set the query data and update to the newest
      queryClient.setQueryData([querykey], (oldTodos: TaskOrCollabTask[]) =>
        oldTodos.filter((todo) => todo.id !== taskId)
      );

      // Return a context object with the snapshotted value
      return { prevTodos };
    },
  });
}

//delete function with invalidating query
export const deleteTask = (
  id: string,
  deleteMutation: UseMutateFunction<
    unknown,
    Error,
    string,
    {
      prevTodos: unknown;
    }
  >,
  querykey: string,
  queryClient: QueryClient
): void => {
  try {
    deleteMutation(id, {
      onSettled: () => {
        console.log("deleting task");
        queryClient.invalidateQueries({
          queryKey: [querykey],
        });
      },
    });

    console.log("deleted");
  } catch (error) {
    console.log(error);
  }
};

export const useFindListQuery = (listId: string, taskId: string) => {
  return useQuery({
    queryFn: async () => await IsInList(listId, taskId),
    queryKey: ["isInList", listId],
  });
};

export const useImportantTaskToggle = (id: string, pathname: string) => {
  return useMutation({
    mutationFn: async (taskId: string) =>
      await markAsImportant(taskId, pathname),
    mutationKey: ["importantMutation"],
  });
};

export const useFetchAssignedTask = () => {
  return useQuery({
    queryKey: ["assignedTasks"],
    queryFn: async () => await fetchAssignedTasks(),
  });
};

export const useFetchYourTasks = () => {
  return useQuery({
    queryKey: ["yourTasks"],
    queryFn: async () => await fetchYourTasksTodos(),
  });
};

export const useFetchUserIds = (debouncedText: string) => {
  return useQuery({
    queryKey: ["usersearch"],
    queryFn: async () => await suggestedUsers(debouncedText),
    staleTime: Infinity,
  });
};

export const useGetSingleTask = (id: string) => {
  return useQuery({
    queryKey: ["singleTask", id],
    queryFn: () => getSingleTask(id),
  });
};
