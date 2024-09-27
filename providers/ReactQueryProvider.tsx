import { fetchAssignedTasks, fetchYourTasksTodos, getPendingTasks, getTask } from "@/app/actions/data";
import { getLists } from "@/app/actions/lists";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default async function ReactQueryProvider({
  children,
}: React.PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 3 * 60 * 1000, // this sets the cache time to 5 minutes
        gcTime: 2 * 2000,
      },
    },
  });

  await Promise.all([
    //prefetching all the data needed before the component renders
    queryClient.prefetchQuery({
      queryKey: ["lists"],
      queryFn: async () => await getLists(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["todolist"],
      queryFn: async () => await getTask("/todo"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["pendings"],
      queryFn: async () => await getPendingTasks(),
    }),
    queryClient.prefetchQuery( { 
        queryKey: ['assignedTasks'],
        queryFn: async () => await fetchYourTasksTodos()
    }),
    queryClient.prefetchQuery({
       queryKey: ['yourTasks'],
       queryFn: async () => await fetchAssignedTasks(),
    })
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </HydrationBoundary>
  );
}
