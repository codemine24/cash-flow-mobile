import apiClient from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface BookData {
  id: string;
  name: string;
  balance: number;
  in: number;
  out: number;
  role: string;
  created_at: string;
  updated_at: string;
  others_member: any[];
}

const BOOK_API_URL = "/book";
const keys = {
  all: ["books"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
}

export const useBooks = () => {
  return useQuery({
    queryKey: keys.list(),
    queryFn: async (): Promise<{ data: BookData[] } | undefined> => {
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
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      try {
        const response = await apiClient.post(BOOK_API_URL, { name });
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      try {
        const response = await apiClient.patch(`${BOOK_API_URL}/${id}`, { name });
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.delete(`${BOOK_API_URL}/${id}`);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};
