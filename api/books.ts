import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useBooks = () => {
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
        try {
            const { data } = await axios.get("http://YOUR_IP:5000/api/books");
            return data;
        } catch (error) {
            console.log(error);
        }
    },
  });
};