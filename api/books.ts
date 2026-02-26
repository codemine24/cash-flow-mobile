import apiClient from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Transaction {
  id: string;
  book_id: string;
  category_id: string | null;
  category?: string;
  entry_by_id: string;
  update_by_id: string | null;
  amount: string | number;
  type: "IN" | "OUT";
  remark: string;
  created_at: string;
  updated_at: string;
}

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
  transactions?: Transaction[];
}

const BOOK_API_URL = "/book";
const keys = {
  all: ["books"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
}

export const useBooks = (searchParams: { search?: string, sort?: string, sort_order?: string } = {}) => {
  // Filter out empty/undefined params
  const params: Record<string, string> = {};
  if (searchParams.search) params.search_term = searchParams.search;
  if (searchParams.sort) params.sort = searchParams.sort;
  if (searchParams.sort_order) params.sort_order = searchParams.sort_order;

  return useQuery({
    queryKey: [...keys.list(), params],
    queryFn: async (): Promise<{ data: BookData[] } | undefined> => {
      try {
        const response = await apiClient.get(BOOK_API_URL, { params });
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
    queryFn: async (): Promise<{ data: BookData } | undefined> => {
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
