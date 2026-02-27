import apiClient from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const TRANSACTION_API_URL = "/transaction";
const keys = {
  all: ["transactions"],
  list: () => [...keys.all, "list"],
  detail: (id: string) => [...keys.all, "detail", id],
};

interface TransactionRequest {
  book_id: string;
  type: string;
  amount: number;
  category_id?: string;
  remark?: string;
  date?: string;
  time?: string;
}

export const useTransactions = () => {
  return useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(TRANSACTION_API_URL);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`${TRANSACTION_API_URL}/${id}`);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: TransactionRequest) => {
      try {
        const response = await apiClient.post(TRANSACTION_API_URL, transaction);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      transaction,
    }: {
      id: string;
      transaction: Partial<TransactionRequest>;
    }) => {
      console.log("transaction......", transaction);
      try {
        const response = await apiClient.patch(
          `${TRANSACTION_API_URL}/${id}`,
          transaction,
        );
        console.log("response......", response);
        return response;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        const response = await apiClient.delete(TRANSACTION_API_URL, {
          data: { ids },
        });
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
