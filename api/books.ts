import apiClient from "@/lib/api-client";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

const BOOK_API_URL = "/book";
const keys = {
  all: ["books"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
}

export const useBooks = () => {
  return useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(BOOK_API_URL);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${BOOK_API_URL}/${id}`);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
  });
};

export const useCreateBook = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      try {
        const response = await apiClient.post(BOOK_API_URL, { name });
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.list() });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      try {
        const response = await apiClient.put(`${BOOK_API_URL}/${id}`, { name });
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: (_, data: any) => {
      queryClient.invalidateQueries({ queryKey: keys.list() });
      queryClient.invalidateQueries({ queryKey: keys.detail(data?.data?.id) });
    },
  });
};
