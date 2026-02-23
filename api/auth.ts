import { setAccessToken, setUserInfo } from "@/lib/_core/auth";
import apiClient from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

export const useSendOtp = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            try {
                const response = await apiClient.post("/auth/get-otp", {
                    email,
                });
                return response;
            } catch (error) {
                console.log(error);
            }
        },
    });
}

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: async ({ email, otp }: { email: string, otp: string }) => {
            try {
                const response = await apiClient.post("/auth/validate-otp", {
                    email,
                    otp: Number(otp),
                });
                return response;
            } catch (error) {
                console.log(error);
            }
        },
        onSuccess: async (data: any) => {
            await setAccessToken(data?.data?.access_token);
            await setUserInfo({
                id: data?.data?.user?.id,
                name: data?.data?.user?.name,
                email: data?.data?.user?.email,
                contact_number: data?.data?.user?.contact_number,
                role: data?.data?.user?.role,
                avatar: data?.data?.user?.avatar,
                status: data?.data?.status,
            });
        }
    });
}
